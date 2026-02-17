import { User, Preference, PulseResponse, Office, Candidate } from '../types';

const OUTBOX_KEY = 'VB_OUTBOX';
const PREFS_KEY = 'v_boy_prefs';
const USER_KEY = 'v_boy_user';
const USER_UPDATED_EVENT = 'vb-user-updated';

const notifyUpdate = () => {
  window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT));
};

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, ms = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal, credentials: "include" });
  } finally {
    clearTimeout(id);
  }
}

// Singleton to cache the initialization promise
let initPromise: Promise<User> | null = null;

export const api = {
  initSession: async (force = false): Promise<User> => {
    if (initPromise && !force) return initPromise;

    initPromise = (async () => {
      try {
        const res = await fetchWithTimeout("/api/session/init", { method: "POST" }, 2500);
        if (!res.ok) throw new Error(`initSession failed: ${res.status}`);
        const data = await res.json();
        
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          notifyUpdate();
          return data.user;
        }
        
        const local = localStorage.getItem(USER_KEY);
        return local ? JSON.parse(local) : data.user;
      } catch (e) {
        console.warn("initSession failed, continuing with fallback:", e);
        let userStr = localStorage.getItem(USER_KEY);
        if (!userStr) {
          const fallback: User = {
            id: 'offline-' + Math.random().toString(36).substr(2, 9),
            onboarded: false,
            standardsAccepted: false
          };
          localStorage.setItem(USER_KEY, JSON.stringify(fallback));
          notifyUpdate();
          return fallback;
        }
        return JSON.parse(userStr);
      } finally {
        api.flushOutbox();
      }
    })();

    return initPromise;
  },

  acceptStandards: async (): Promise<User> => {
    try {
      const res = await fetchWithTimeout('/api/user/standards', { 
        method: 'POST', 
        body: JSON.stringify({ accepted: true }),
        headers: { 'Content-Type': 'application/json' }
      });
      const updatedUser = await res.json();
      const user = { ...updatedUser, onboarded: !!(updatedUser.state && updatedUser.lga) };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      notifyUpdate();
      return user;
    } catch (e) {
      const local = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      const updated = { ...local, standardsAccepted: true };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      notifyUpdate();
      return updated as User;
    }
  },

  updateLocation: async (updates: Partial<User>): Promise<User> => {
    try {
      const res = await fetchWithTimeout('/api/user/location', {
        method: 'POST',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' }
      });
      const updatedUser = await res.json();
      const user = { ...updatedUser, onboarded: !!(updatedUser.state && updatedUser.lga) };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      notifyUpdate();
      return user;
    } catch (e) {
      const local = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      const updated = { ...local, ...updates };
      updated.onboarded = !!(updated.state && updated.lga);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      notifyUpdate();
      return updated as User;
    }
  },

  getOffices: async (): Promise<Office[]> => {
    try {
      const res = await fetchWithTimeout('/api/offices');
      if (!res.ok) throw new Error('Failed to fetch offices');
      const data = await res.json();
      localStorage.setItem('v_boy_offices', JSON.stringify(data));
      return data;
    } catch (e) {
      return JSON.parse(localStorage.getItem('v_boy_offices') || '[]');
    }
  },

  getCandidateById: async (id: string): Promise<Candidate | undefined> => {
    try {
      const res = await fetchWithTimeout(`/api/candidates/${id}`);
      if (!res.ok) return undefined;
      return res.json();
    } catch (e) {
      return undefined;
    }
  },

  getCandidates: async (officeId: string, state: string, lga: string): Promise<Candidate[]> => {
    try {
      const params = new URLSearchParams({ officeId, state: state || '', lga: lga || '' });
      const res = await fetchWithTimeout(`/api/candidates?${params.toString()}`);
      if (!res.ok) return [];
      return res.json();
    } catch (e) {
      return [];
    }
  },

  savePreference: async (pref: Omit<Preference, 'id' | 'createdAt'>): Promise<void> => {
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
    const filtered = stored.filter((p: any) => p.officeId !== pref.officeId);
    const newPref = { ...pref, id: `local-${Date.now()}`, createdAt: Date.now() };
    localStorage.setItem(PREFS_KEY, JSON.stringify([...filtered, newPref]));

    try {
      const res = await fetchWithTimeout('/api/preferences', {
        method: 'POST',
        body: JSON.stringify(pref),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('API Error');
      const saved = await res.json();
      
      const current = JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
      const updated = current.map((p: any) => p.officeId === pref.officeId ? saved : p);
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    } catch (e) {
      const outbox = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
      outbox.push(pref);
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
    }
  },

  getPreferences: (): Preference[] => {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
  },

  getPulse: async (state: string): Promise<Record<string, PulseResponse | null>> => {
    try {
      const res = await fetchWithTimeout(`/api/pulse?state=${state}`);
      if (!res.ok) return {};
      return res.json();
    } catch (e) {
      return {};
    }
  },

  flushOutbox: async () => {
    const outbox = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
    if (outbox.length === 0) return;

    const remaining = [];
    for (const item of outbox) {
      try {
        await fetchWithTimeout('/api/preferences', {
          method: 'POST',
          body: JSON.stringify(item),
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        remaining.push(item);
      }
    }
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(remaining));
  }
};

window.addEventListener('online', api.flushOutbox);
