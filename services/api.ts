
import { User, Preference, PulseResponse, Office, Candidate, Scope } from '../types';
import { MOCK_CANDIDATES, OFFICES } from '../constants.tsx';

const USER_KEY = 'v_boy_user';
const PREFS_KEY = 'v_boy_prefs';
const GLOBAL_VOTES_KEY = 'v_boy_global_votes'; // Mocking a global store

// Initialize fake global data for Pulse demo (if empty)
const initGlobalData = () => {
  if (!localStorage.getItem(GLOBAL_VOTES_KEY)) {
    const fakeVotes: any[] = [];
    // Add 30 votes for President Candidate A to trigger "Pulse" view >= 25
    for (let i = 0; i < 30; i++) {
      fakeVotes.push({
        officeId: '1',
        candidateId: 'p1',
        state: 'Lagos'
      });
    }
    localStorage.setItem(GLOBAL_VOTES_KEY, JSON.stringify(fakeVotes));
  }
};

export const api = {
  initSession: (): User => {
    initGlobalData();
    const stored = localStorage.getItem(USER_KEY);
    if (stored) return JSON.parse(stored);
    
    const newUser: User = {
      id: crypto.randomUUID(),
      state: '',
      lga: '',
      privacyDefault: true,
      onboarded: false
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  updateLocation: (updates: Partial<User>): User => {
    const current = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    const updated = { ...current, ...updates, onboarded: true };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  getOffices: (): Office[] => OFFICES,

  getCandidates: (officeId: string, state: string, lga: string): Candidate[] => {
    return MOCK_CANDIDATES.filter(c => {
      if (c.officeId !== officeId) return false;
      const office = OFFICES.find(o => o.id === officeId);
      if (!office) return false;

      if (office.scope === Scope.NATIONAL) return true;
      if (office.scope === Scope.STATE && c.state === state) return true;
      if (office.scope === Scope.LGA && c.state === state && c.lga === lga) return true;
      return false;
    });
  },

  savePreference: (pref: Omit<Preference, 'id' | 'createdAt'>): void => {
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
    const newPref = {
      ...pref,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    
    // Replace if existing for this office
    const filtered = stored.filter((p: Preference) => p.officeId !== pref.officeId);
    localStorage.setItem(PREFS_KEY, JSON.stringify([...filtered, newPref]));

    // Also update fake global store for Pulse
    const globalVotes = JSON.parse(localStorage.getItem(GLOBAL_VOTES_KEY) || '[]');
    const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    globalVotes.push({
      officeId: pref.officeId,
      candidateId: pref.candidateId,
      state: user.state,
      lga: user.lga
    });
    localStorage.setItem(GLOBAL_VOTES_KEY, JSON.stringify(globalVotes));
  },

  getPreferences: (): Preference[] => {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
  },

  getPulse: (officeId: string, state: string): PulseResponse | null => {
    const globalVotes = JSON.parse(localStorage.getItem(GLOBAL_VOTES_KEY) || '[]');
    const filteredVotes = globalVotes.filter((v: any) => v.officeId === officeId && v.state === state);
    
    const office = OFFICES.find(o => o.id === officeId);
    if (!office) return null;

    if (filteredVotes.length < 25) return null;

    const counts: Record<string, number> = {};
    filteredVotes.forEach((v: any) => {
      counts[v.candidateId] = (counts[v.candidateId] || 0) + 1;
    });

    const data = Object.entries(counts).map(([id, count]) => {
      const cand = MOCK_CANDIDATES.find(c => c.id === id);
      return {
        candidateId: id,
        candidateName: cand?.name || 'Unknown',
        party: cand?.party || 'Unknown',
        count
      };
    }).sort((a, b) => b.count - a.count);

    return {
      officeName: office.name,
      totalVotes: filteredVotes.length,
      data
    };
  }
};
