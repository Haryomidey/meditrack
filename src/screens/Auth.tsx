import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { useStore } from '../store/useStore';
import { BiCapsule } from 'react-icons/bi';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login, signup, isLoading, error, clearError } = useStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    pharmacyName: '',
    branchName: '',
    branchCode: '',
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (isRegistering) {
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          pharmacyName: formData.pharmacyName,
          branchName: formData.branchName,
          branchCode: formData.branchCode,
        });
        return;
      }

      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch {
      // Error state is handled in store.
    }
  };

  return (
    <div className="min-h-screen bg-emerald-600 flex flex-col p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -mr-32 -mt-32 opacity-20" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="mb-12">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-6"><BiCapsule size={32} className="text-emerald-600" /></div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-emerald-100 font-medium">MediTrack Community Pharmacy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-6 shadow-2xl">
            {isRegistering && (
              <div className="space-y-4 mb-4">
                <Input label="Pharmacy Name" placeholder="Pharmacy Name" required value={formData.pharmacyName} onChange={e => setFormData({...formData, pharmacyName: e.target.value})} />
                <Input label="Branch Name" placeholder="Main Branch" required value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} />
                <Input label="Branch Code" placeholder="MAIN-001" required value={formData.branchCode} onChange={e => setFormData({...formData, branchCode: e.target.value})} />
                <Input label="Owner Name" placeholder="Owner Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            )}

            <Input label="Email Address" type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input label="Password" type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />

            {error && (
              <p className="mt-2 text-sm font-semibold text-red-500">{error}</p>
            )}

            <Button disabled={isLoading} type="submit" fullWidth className="mt-6 py-4">
              {isLoading ? 'Please wait...' : isRegistering ? 'Register Pharmacy' : 'Login to Dashboard'}
              <HiOutlineArrowRight size={20} />
            </Button>
          </Card>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              clearError();
              setIsRegistering(!isRegistering);
            }}
            className="text-emerald-50 font-bold text-sm"
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
