
export enum Scope {
  NATIONAL = 'NATIONAL',
  STATE = 'STATE',
  LGA = 'LGA',
  WARD = 'WARD'
}

export interface User {
  id: string;
  state: string;
  lga: string;
  ward?: string;
  privacyDefault: boolean;
  onboarded: boolean;
}

export interface Office {
  id: string;
  key: string;
  name: string;
  scope: Scope;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  officeId: string;
  state?: string;
  lga?: string;
  ward?: string;
  verified: boolean;
}

export interface Preference {
  id: string;
  userId: string;
  officeId: string;
  candidateId: string;
  reasons: string[];
  createdAt: number;
}

export interface PulseRecord {
  candidateId: string;
  candidateName: string;
  party: string;
  count: number;
}

export interface PulseResponse {
  officeName: string;
  totalVotes: number;
  data: PulseRecord[];
}
