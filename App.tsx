
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './components/Landing';
import Onboarding from './components/Onboarding';
import Ballot from './components/Ballot';
import Pulse from './components/Pulse';
import { api } from './services/api';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(api.initSession());
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/ballot" element={user?.onboarded ? <Ballot /> : <Navigate to="/onboarding" />} />
          <Route path="/pulse" element={user?.onboarded ? <Pulse /> : <Navigate to="/onboarding" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
