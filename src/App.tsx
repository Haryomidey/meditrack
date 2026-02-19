import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SplashScreen } from './screens/SplashScreen';
import { Login } from './screens/Auth';
import { Dashboard } from './screens/Dashboard';
import { Inventory } from './screens/Inventory';
import { DrugDetails } from './screens/DrugDetails';
import { Sales } from './screens/Sales';
import { Prescriptions } from './screens/Prescriptions';
import { Reports } from './screens/Reports';
import { History } from './screens/History';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { useStore } from './store/useStore';
import { useNotifications } from './hooks/useNotifications';
import { useRealtimeSync } from './hooks/useRealtimeSync';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, setOnline, hydrateSession, loadAllData, inventory, prescriptions } = useStore();

  useNotifications(Boolean(user), inventory, prescriptions);
  useRealtimeSync(Boolean(user));

  useEffect(() => {
    // Offline status listener
    const handleOnline = async () => {
      setOnline(true);
      if (useStore.getState().user) {
        await loadAllData();
      }
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Hydrate auth/session and load data from backend
    const bootstrap = async () => {
      await hydrateSession();
    };
    bootstrap();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hydrateSession, loadAllData, setOnline]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <ScrollToTop />
      <PwaInstallPrompt />
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<DrugDetails />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/history" element={<History />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;