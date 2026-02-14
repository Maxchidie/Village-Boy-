
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Office, Candidate, Preference, User } from '../types';
import { ISSUE_TAGS } from '../constants';

const Ballot: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [selectingOffice, setSelectingOffice] = useState<Office | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  useEffect(() => {
    const u = api.initSession();
    setUser(u);
    setOffices(api.getOffices());
    setPreferences(api.getPreferences());
  }, []);

  const openSelection = (office: Office) => {
    if (!user) return;
    setSelectingOffice(office);
    setCandidates(api.getCandidates(office.id, user.state, user.lga));
    setSearchTerm('');
    setSelectedReasons([]);
  };

  const saveChoice = (candidateId: string) => {
    if (!selectingOffice || !user) return;
    api.savePreference({
      userId: user.id,
      officeId: selectingOffice.id,
      candidateId,
      reasons: selectedReasons
    });
    setPreferences(api.getPreferences());
    setSelectingOffice(null);
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.party.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      <header className="bg-green-600 text-white p-6 rounded-[2rem] shadow-xl shadow-green-100 dark:shadow-green-900/20 space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">My Village Ballot</h2>
        <p className="text-2xl font-bold leading-tight">
          {user?.state || 'Select State'}, <br/>
          <span className="opacity-70">{user?.lga || 'Select LGA'}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {offices.map((office) => {
          const pref = preferences.find(p => p.officeId === office.id);
          const chosen = candidates.find(c => c.id === pref?.candidateId);
          
          return (
            <div key={office.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 transition-colors">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{office.name}</h4>
                <p className={`font-bold ${chosen ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-700 italic'}`}>
                  {chosen ? chosen.name : 'Unassigned'}
                </p>
                {chosen && <p className="text-xs text-green-600 dark:text-green-500 font-medium">{chosen.party}</p>}
              </div>
              <button 
                onClick={() => openSelection(office)}
                className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${chosen ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700' : 'bg-green-600 text-white shadow-lg shadow-green-100 dark:shadow-green-900/20'}`}
              >
                {chosen ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selection Modal */}
      {selectingOffice && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-6 max-h-[90vh] overflow-y-auto space-y-6 animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
            <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 py-2 z-10 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Choose {selectingOffice.name}</h3>
              <button onClick={() => setSelectingOffice(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <input 
              type="text" 
              placeholder="Search by name or party..."
              className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-green-600 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Candidates Available</h4>
              {filteredCandidates.length > 0 ? filteredCandidates.map((c) => (
                <div key={c.id} className="p-4 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all flex items-center justify-between gap-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400 dark:text-slate-600">
                      {c.party.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{c.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.party}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => saveChoice(c.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-green-100 dark:shadow-green-900/20"
                  >
                    Select
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">No candidates found for this scope.</div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Why this choice? (Optional)</h4>
              <div className="flex flex-wrap gap-2">
                {ISSUE_TAGS.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSelectedReasons(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${selectedReasons.includes(tag) ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ballot;
