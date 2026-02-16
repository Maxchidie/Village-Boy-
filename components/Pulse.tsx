
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PulseResponse, Office, User } from '../types';

const Pulse: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [pulseData, setPulseData] = useState<Record<string, PulseResponse | null>>({});
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
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Village Pulse</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Real-time preference snapshots for <span className="font-bold text-slate-700 dark:text-slate-300">{user?.state}</span>. Minimum 25 records required to show insights.</p>
      </header>

      <div className="space-y-6">
        {offices.map(o => {
          const data = pulseData[o.id] as any;
          const isAllowed = data?.allowed;

          return (
            <div key={o.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{o.name}</h3>
                {isAllowed && <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">{data.totalVotes} Samples</span>}
              </div>

              {isAllowed ? (
                <div className="space-y-4">
                  {data.data.map((record: any, idx: number) => {
                    const percentage = Math.round((record.count / data.totalVotes) * 100);
                    return (
                      <div key={record.candidateId} className="space-y-1.5">
                        <div className="flex justify-between text-sm items-center">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{record.candidateName} <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">({record.party})</span></span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{percentage}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.3)]' : 'bg-slate-300 dark:bg-slate-700'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-500">Not Enough Data</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 max-w-[200px]">We need {25 - (data?.totalVotes || 0)} more responses for {o.name} in {user?.state} to show insights.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pulse;
