import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Office, Candidate, Preference, User } from '../types';
import { ISSUE_TAGS } from '../constants';

const Ballot: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [selectingOffice, setSelectingOffice] = useState<Office | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [resolvedCandidates, setResolvedCandidates] = useState<Record<string, Candidate>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await api.initSession();
      const offs = await api.getOffices();
      const prefs = api.getPreferences();
      setUser(u);
      setOffices(offs);
      setPreferences(prefs);
      
      const resolved: Record<string, Candidate> = {};
      for (const p of prefs) {
        const cand = await api.getCandidateById(p.candidateId);
        if (cand) resolved[p.candidateId] = cand;
      }
      setResolvedCandidates(resolved);
      setLoading(false);
    };
    load();
  }, []);

  const openSelection = async (office: Office) => {
    if (!user) return;
    setSelectingOffice(office);
    setSelectedCandidate(null);
    const cands = await api.getCandidates(office.id, user.state, user.lga);
    setCandidates(cands);
    setSearchTerm('');
    setSelectedReasons([]);
  };

  const toggleReason = (tag: string) => {
    setSelectedReasons(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const confirmChoice = async () => {
    if (!selectingOffice || !selectedCandidate || !user) return;
    
    const prefData = {
      userId: user.id,
      officeId: selectingOffice.id,
      candidateId: selectedCandidate.id,
      reasons: selectedReasons
    };
    
    setResolvedCandidates(prev => ({ ...prev, [selectedCandidate.id]: selectedCandidate }));
    await api.savePreference(prefData);
    setPreferences(api.getPreferences());
    
    // Close all
    setSelectingOffice(null);
    setSelectedCandidate(null);
  };

  const handleShare = async () => {
    if (!user) return;
    let summary = `🗳️ My Village Boy Ballot Summary\n📍 ${user.state} / ${user.lga}\n\n`;
    preferences.forEach(p => {
      const office = offices.find(o => o.id === p.officeId);
      const cand = resolvedCandidates[p.candidateId];
      if (office && cand) summary += `• ${office.name}: ${cand.name} (${cand.party})\n`;
    });
    summary += `\nJoin the village pulse: ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Village Boy Ballot', text: summary, url: window.location.origin });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-green-600"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Ballot...</p>
    </div>
  );

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.party.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 max-w-md mx-auto">
      <header className="bg-green-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-green-100 dark:shadow-green-900/10 space-y-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Local Jurisdiction</h2>
            <p className="text-2xl font-black leading-tight tracking-tight">
              {user?.state || 'N/A'}, <br/>
              <span className="opacity-70 text-lg">{user?.lga || 'N/A'}</span>
            </p>
          </div>
          <button 
            onClick={handleShare} 
            className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        
        {copySuccess && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <span className="bg-white/95 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce">
              Ballot Copied!
            </span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4">
        {offices.map((office) => {
          const pref = preferences.find(p => p.officeId === office.id);
          const chosen = pref ? resolvedCandidates[pref.candidateId] : null;
          return (
            <div key={office.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{office.name}</h4>
                <p className={`text-lg font-black tracking-tight ${chosen ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-700'}`}>
                  {chosen ? chosen.name : 'Unassigned'}
                </p>
                {chosen && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">{chosen.party}</span>
                    {pref?.reasons && pref.reasons.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">+{pref.reasons.length} Reasons</span>
                    )}
                  </div>
                )}
              </div>
              <button 
                onClick={() => openSelection(office)} 
                className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${chosen ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-green-600 text-white shadow-lg shadow-green-100 dark:shadow-green-900/10'}`}
              >
                {chosen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {selectingOffice && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white dark:bg-slate-900 rounded-t-[3rem] p-6 max-h-[92vh] overflow-y-auto space-y-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 py-4 z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {selectedCandidate ? 'Why this choice?' : `Choose ${selectingOffice.name}`}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{selectedCandidate ? `Refine your support for ${selectedCandidate.name}` : `Select your preferred candidate for this role.`}</p>
              </div>
              <button 
                onClick={() => { setSelectingOffice(null); setSelectedCandidate(null); }} 
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {!selectedCandidate ? (
              <div className="space-y-6">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search candidate or party..." 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-green-600 transition-all" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>

                <div className="space-y-3">
                  {filteredCandidates.length > 0 ? filteredCandidates.map((c) => (
                    <button 
                      key={c.id} 
                      onClick={() => setSelectedCandidate(c)}
                      className="w-full p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 hover:border-green-600/30 transition-all active:scale-[0.98]"
                    >
                      <div className="text-left">
                        <p className="font-black text-slate-900 dark:text-slate-100 tracking-tight">{c.name}</p>
                        <p className="text-xs font-bold text-green-600 uppercase tracking-widest">{c.party}</p>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </button>
                  )) : (
                    <div className="text-center py-12 space-y-2">
                      <p className="text-slate-400 font-medium">No candidates found.</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Try adjusting your search</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 p-5 bg-green-50 dark:bg-green-900/10 rounded-[2rem] border border-green-100 dark:border-green-900/20">
                  <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-200/50">
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-slate-100 text-lg tracking-tight">{selectedCandidate.name}</p>
                    <p className="text-xs font-black text-green-600 tracking-[0.2em] uppercase">{selectedCandidate.party}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Primary Reasons for Support</h4>
                  <div className="flex flex-wrap gap-2">
                    {ISSUE_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleReason(tag)}
                        className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${selectedReasons.includes(tag) ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button 
                    onClick={confirmChoice}
                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg active:scale-95 transition-all"
                  >
                    Confirm Choice
                  </button>
                  <button 
                    onClick={() => setSelectedCandidate(null)}
                    className="w-full text-slate-400 font-bold text-sm py-2"
                  >
                    Change Candidate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ballot;