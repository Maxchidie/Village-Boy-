
import { User, Preference, PulseResponse, Office, Candidate } from '../types';

const OUTBOX_KEY = 'VB_OUTBOX';

export const api = {
  initSession: async (): Promise<User> => {
    const res = await fetch('/api/session/init', { method: 'POST' });
    const data = await res.json();
    
    // Maintain local state for navigation guards
    const localUser = JSON.parse(localStorage.getItem('v_boy_user') || '{}');
    if (!localUser.id) {
      localUser.id = data.sessionId;
      localStorage.setItem('v_boy_user', JSON.stringify(localUser));
    }
    
    // Attempt outbox flush
    api.flushOutbox();
    
    return localUser;
  },

  acceptStandards: async (): Promise<User> => {
    const localUser = JSON.parse(localStorage.getItem('v_boy_user') || '{}');
    localUser.standardsAccepted = true;
    localStorage.setItem('v_boy_user', JSON.stringify(localUser));
    
    await fetch('/api/user/standards', { 
      method: 'POST', 
      body: JSON.stringify({ accepted: true }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {}); // Silent fail, we have local state

    return localUser;
  },

  updateLocation: async (updates: Partial<User>): Promise<User> => {
    const current = JSON.parse(localStorage.getItem('v_boy_user') || '{}');
    const updated = { ...current, ...updates, onboarded: true };
    localStorage.setItem('v_boy_user', JSON.stringify(updated));

    await fetch('/api/user/location', {
      method: 'POST',
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {});

    return updated;
  },

  getOffices: async (): Promise<Office[]> => {
    const res = await fetch('/api/offices');
    return res.json();
  },

  getCandidateById: async (id: string): Promise<Candidate | undefined> => {
    const res = await fetch(`/api/candidates/${id}`);
    if (!res.ok) return undefined;
    return res.json();
  },

  getCandidates: async (officeId: string, state: string, lga: string): Promise<Candidate[]> => {
    const params = new URLSearchParams({ officeId, state, lga });
    const res = await fetch(`/api/candidates?${params.toString()}`);
    return res.json();
  },

  savePreference: async (pref: Omit<Preference, 'id' | 'createdAt'>): Promise<void> => {
    // 1. Save locally for immediate UI feedback
    const stored = JSON.parse(localStorage.getItem('v_boy_prefs') || '[]');
    const filtered = stored.filter((p: any) => p.officeId !== pref.officeId);
    localStorage.setItem('v_boy_prefs', JSON.stringify([...filtered, pref]));

    // 2. Try network
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        body: JSON.stringify(pref),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('API Error');
    } catch (e) {
      // 3. Queue for later
      const outbox = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
      outbox.push(pref);
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
    }
  },

  getPreferences: (): Preference[] => {
    return JSON.parse(localStorage.getItem('v_boy_prefs') || '[]');
  },

  getPulse: async (state: string): Promise<Record<string, PulseResponse | null>> => {
    const res = await fetch(`/api/pulse?state=${state}`);
    return res.json();
  },

  flushOutbox: async () => {
    const outbox = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
    if (outbox.length === 0) return;

    const remaining = [];
    for (const item of outbox) {
      try {
        await fetch('/api/preferences', {
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

// Listen for online events to flush outbox
window.addEventListener('online', api.flushOutbox);
