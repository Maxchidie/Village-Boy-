
import React, { useEffect, useState } from 'react';
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Handle the promise returned by api.initSession instead of passing the promise directly to setUser
    api.initSession().then(setUser);
  }, []);

  // Use async/await to resolve the promise from api.initSession before updating state
  const refreshUser = async () => {
    const u = await api.initSession();
    setUser(u);
  };

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
            element={user?.onboarded ? <Ballot /> : <Navigate to={user?.standardsAccepted ? "/onboarding" : "/standards"} />} 
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
