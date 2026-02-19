import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiCapsule } from 'react-icons/bi';
import { HiOutlinePlus } from 'react-icons/hi2';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-emerald-600 flex flex-col items-center justify-center text-white z-[100]">
      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: [0, 1.2, 1], rotate: 0 }} transition={{ duration: 0.8, ease: "backOut" }} className="relative mb-6">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
          <BiCapsule size={48} className="text-emerald-600" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute -top-2 -right-2 bg-emerald-400 p-2 rounded-xl border-4 border-emerald-600">
            <HiOutlinePlus size={20} />
          </motion.div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center">
        <h1 className="text-3xl font-black tracking-tighter mb-1">MediTrack</h1>
        <p className="text-emerald-100 text-sm font-medium tracking-wide">OFFLINE-FIRST PHARMACY MANAGER</p>
      </motion.div>
      <div className="absolute bottom-12 w-16 h-1 bg-emerald-500 rounded-full overflow-hidden">
        <motion.div initial={{ x: -64 }} animate={{ x: 64 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-full h-full bg-white" />
      </div>
    </div>
  );
};
