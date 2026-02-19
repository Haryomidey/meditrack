
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700",
    secondary: "bg-white text-emerald-700 border border-emerald-100 shadow-sm hover:bg-emerald-50",
    danger: "bg-red-500 text-white shadow-lg shadow-red-100 hover:bg-red-600",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}
  >
    {children}
  </motion.div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full mb-4">
    {label && <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">{label}</label>}
    <input 
      className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all ${className}`}
      {...props}
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' }> = ({ children, variant = 'info' }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700"
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${styles[variant]}`}>{children}</span>;
};
