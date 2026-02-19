
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HiOutlineSquares2X2, 
  HiOutlineCube, 
  HiOutlineShoppingCart, 
  HiOutlineDocumentText, 
  HiOutlineChartBar,
  HiOutlineWifi,
  HiOutlineSignalSlash
} from 'react-icons/hi2';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isOnline } = useStore();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: HiOutlineSquares2X2, label: 'Home' },
    { to: '/inventory', icon: HiOutlineCube, label: 'Stock' },
    { to: '/sales', icon: HiOutlineShoppingCart, label: 'Sell' },
    { to: '/prescriptions', icon: HiOutlineDocumentText, label: 'Rx' },
    { to: '/reports', icon: HiOutlineChartBar, label: 'Stats' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col">
      <header className="sticky top-0 z-40 glass-header border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            {user?.pharmacyName || 'MediTrack'}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {isOnline ? 'Cloud Synced' : 'Offline Mode'}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
          {user?.name?.[0] || 'M'}
        </div>
      </header>

      <main className="flex-1 p-5 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isOnline && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border border-gray-800">
            <HiOutlineSignalSlash size={16} className="text-red-400" />
            <span className="text-xs font-semibold">Working Offline</span>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-3 safe-area-bottom z-50 flex items-center justify-around shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex flex-col items-center gap-1 px-4 py-1.5 transition-all
              ${isActive ? 'text-emerald-600' : 'text-gray-400'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={22} />
                <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
