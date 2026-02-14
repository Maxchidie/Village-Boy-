
import { Scope, Office, Candidate } from './types';

export const NIGERIAN_STATES = [
  'Lagos', 'Kano', 'Rivers', 'Anambra', 'Oyo', 'Kaduna', 'FCT - Abuja', 'Edo', 'Enugu', 'Delta'
];

export const LGAS_BY_STATE: Record<string, string[]> = {
  'Lagos': ['Ikeja', 'Alimosho', 'Lagos Island', 'Eti-Osa', 'Surulere'],
  'Kano': ['Kano Municipal', 'Dala', 'Gwale', 'Fagge'],
  'Rivers': ['Port Harcourt', 'Obio/Akpor', 'Eleme', 'Bonny'],
  'FCT - Abuja': ['AMAC', 'Bwari', 'Gwagwalada', 'Kuje'],
};

export const OFFICES: Office[] = [
  { id: '1', key: 'pres', name: 'President', scope: Scope.NATIONAL },
  { id: '2', key: 'gov', name: 'Governor', scope: Scope.STATE },
  { id: '3', key: 'sen', name: 'Senate', scope: Scope.STATE },
  { id: '4', key: 'rep', name: 'House of Reps', scope: Scope.STATE },
  { id: '5', key: 'chair', name: 'LGA Chairman', scope: Scope.LGA },
  { id: '6', key: 'councillor', name: 'Councillor', scope: Scope.WARD },
];

export const MOCK_CANDIDATES: Candidate[] = [
  // National - President
  { id: 'p1', name: 'Candidate A', party: 'Party 1', officeId: '1', verified: true },
  { id: 'p2', name: 'Candidate B', party: 'Party 2', officeId: '1', verified: true },
  { id: 'p3', name: 'Candidate C', party: 'Party 3', officeId: '1', verified: true },
  
  // State - Governor (Lagos)
  { id: 'g1', name: 'Governor Candidate X', party: 'Party 1', officeId: '2', state: 'Lagos', verified: true },
  { id: 'g2', name: 'Governor Candidate Y', party: 'Party 2', officeId: '2', state: 'Lagos', verified: true },
  
  // LGA - Chairman (Ikeja)
  { id: 'c1', name: 'Chair Candidate L1', party: 'Party 1', officeId: '5', state: 'Lagos', lga: 'Ikeja', verified: true },
  { id: 'c2', name: 'Chair Candidate L2', party: 'Party 2', officeId: '5', state: 'Lagos', lga: 'Ikeja', verified: true },
];

export const ISSUE_TAGS = ['Security', 'Economy', 'Education', 'Healthcare', 'Infrastructure', 'Rule of Law', 'Agriculture'];
