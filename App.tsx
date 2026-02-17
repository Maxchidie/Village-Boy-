import React, { useEffect, useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './components/Landing';
import Standards from './components/Standards';
import Onboarding from './components/Onboarding';
import Ballot from './components/Ballot';
import Pulse from './components/Pulse';
import { api } from './services/api';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const local = localStorage.getItem('v_boy_user');
    return local ? JSON.parse(local) : null;
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        // IMPORTANT: never wait forever
        await Promise.race([
          api.initSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("init timeout")), 2500)),
        ]);
      } catch (e) {
        console.warn("Boot continuing without API:", e);
        // fail-open: allow app to load even if API is down
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    boot();

    const handleUpdate = () => {
      const local = localStorage.getItem('v_boy_user');
      if (local) setUser(JSON.parse(local));
    };
    window.addEventListener('vb-user-updated', handleUpdate);
    
    return () => { 
      mounted = false; 
      window.removeEventListener('vb-user-updated', handleUpdate);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl animate-bounce mb-4 shadow-lg shadow-green-200 dark:shadow-green-900/20">V</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
        </div>
        <p className="mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Village Boy Loading...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/standards" element={<Standards />} />
          <Route 
            path="/onboarding" 
            element={user?.standardsAccepted ? <Onboarding /> : <Navigate to="/standards" />} 
          />
          <Route 
            path="/ballot" 
            element={user?.onboarded ? <Ballot /> : <Navigate to={user?.standardsAccepted ? (user?.onboarded ? "/ballot" : "/onboarding") : "/standards"} />} 
          />
          <Route 
            path="/pulse" 
            element={user?.onboarded ? <Pulse /> : <Navigate to={user?.standardsAccepted ? "/onboarding" : "/standards"} />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
