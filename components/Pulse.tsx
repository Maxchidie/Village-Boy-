import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PulseResponse, Office, User } from '../types';

const Pulse: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [pulseData, setPulseData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await api.initSession();
      const offs = await api.getOffices();
      setUser(u);
      setOffices(offs);

      if (u.state) {
        const data = await api.getPulse(u.state);
        setPulseData(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-green-600"></div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Syncing Village Pulse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-md mx-auto">
      <header className="space-y-2 px-2">
        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
          LIVE Community Data
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Village Pulse</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Aggregated snapshots for <span className="font-bold text-slate-700 dark:text-slate-300">{user?.state}</span>. 
          Privacy is maintained by only showing data once a local community reaches 25+ voters.
        </p>
      </header>

      <div className="space-y-6">
        {offices.map(o => {
          const data = pulseData[o.id];
          const isAllowed = data?.allowed;

          return (
            <div key={o.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{o.name}</h3>
                {isAllowed && (
                  <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    {data.totalVotes} Voters
                  </span>
                )}
              </div>

              {isAllowed ? (
                <div className="space-y-5">
                  {data.data.map((record: any, idx: number) => {
                    const percentage = Math.round((record.count / data.totalVotes) * 100);
                    return (
                      <div key={record.candidateId} className="space-y-2">
                        <div className="flex justify-between text-sm items-end">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{record.candidateName}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{record.party}</span>
                          </div>
                          <span className="font-black text-slate-900 dark:text-slate-100">{percentage}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            style={{ width: `${percentage}%` }}
                            role="progressbar"
                            aria-valuenow={percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-slate-300 dark:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Sample size too small</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 max-w-[220px] mx-auto leading-relaxed">
                      We need at least 25 responses for {o.name} to show results. Current: <span className="text-green-600 font-bold">{data?.totalVotes || 0}</span>
                    </p>
                  </div>
                  <button className="text-[10px] font-bold text-green-600 uppercase tracking-widest hover:underline">Invite your village</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-6 bg-slate-900 rounded-[2rem] text-slate-400 text-[10px] leading-relaxed">
        <p className="font-bold text-slate-200 mb-2">Privacy & Methodology</p>
        <p>Pulse data is non-binding and intended for community sentiment analysis only. Data is aggregated anonymously across all users in {user?.state || 'the selected state'}. We do not track individual votes to specific users after aggregation.</p>
      </div>
    </div>
  );
};

export default Pulse;
