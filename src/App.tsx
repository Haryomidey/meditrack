
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SplashScreen } from './screens/SplashScreen';
import { Login } from './screens/Auth';
import { Dashboard } from './screens/Dashboard';
import { Inventory } from './screens/Inventory';
import { DrugDetails } from './screens/DrugDetails';
import { Sales } from './screens/Sales';
import { Prescriptions } from './screens/Prescriptions';
import { Reports } from './screens/Reports';
import { Layout } from './components/Layout';
import { useStore } from './store/useStore';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, setOnline, loadInventory, loadSales, loadPrescriptions, seedData } = useStore();

  useEffect(() => {
    // Offline status listener
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial data load from IndexedDB
    const bootstrap = async () => {
      await loadInventory();
      await loadSales();
      await loadPrescriptions();
      // Only seeds if empty
      await seedData();
    };
    bootstrap();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<DrugDetails />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
