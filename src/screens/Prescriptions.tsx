
import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { useStore } from '../store/useStore';
import { HiOutlineDocumentPlus, HiOutlineMagnifyingGlass, HiOutlineUser, HiOutlineClipboard, HiOutlinePlus, HiOutlineXMark, HiOutlineUserMinus } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

export const Prescriptions: React.FC = () => {
  const { prescriptions, addPrescription } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({ patientName: '', dosageInstructions: '', prescribingDoctor: '', refillReminder: true, drugs: [] });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRx) return;
    setIsSubmittingRx(true);

    try {
      await addPrescription({ patientName: formData.patientName, dosageInstructions: formData.dosageInstructions, prescribingDoctor: formData.prescribingDoctor, refillReminder: formData.refillReminder });
      setIsAdding(false);
      setFormData({ patientName: '', dosageInstructions: '', prescribingDoctor: '', refillReminder: true, drugs: [] });
    } finally {
      setIsSubmittingRx(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Prescriptions</h2>
        <Button onClick={() => setIsAdding(true)} variant="secondary" className="py-2 px-4 text-sm"><HiOutlinePlus size={16} /> New Rx</Button>
      </div>

      <div className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by patient name..." 
          className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl shadow-sm border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-100 transition-all" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="space-y-4">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((rx) => (
            <Card key={rx.id} className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><HiOutlineUser size={24} /></div>
                <div><h3 className="font-bold text-gray-900 leading-tight">{rx.patientName}</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(rx.timestamp).toLocaleDateString()} • REF: {rx.id.slice(0, 6)}</p></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4"><p className="text-xs font-semibold text-gray-700 italic">"{rx.dosageInstructions}"</p></div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-600 shadow-sm">
                      <HiOutlineClipboard size={12} />
                    </div>
                  ))}
                </div>
                <Badge variant={rx.refillReminder ? 'info' : 'success'}>{rx.refillReminder ? 'Refill Active' : 'Completed'}</Badge>
              </div>
            </Card>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <HiOutlineUserMinus size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No patient found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-[240px]">We couldn't find any prescriptions matching "{search}".</p>
            <Button 
              variant="secondary" 
              onClick={() => {
                setSearch('');
                setIsAdding(true);
              }}
            >
              <HiOutlinePlus size={18} /> Add New Patient
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <HiOutlineDocumentPlus size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">New Prescription</h3>
                </div>
                <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><HiOutlineXMark size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <Input label="Patient Full Name" required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} />
                <Input label="Prescribing Doctor" required value={formData.prescribingDoctor} onChange={e => setFormData({...formData, prescribingDoctor: e.target.value})} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600 ml-1">Dosage Instructions</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all h-24 resize-none" 
                    placeholder="e.g. 1 tab daily before meals..." 
                    value={formData.dosageInstructions} 
                    onChange={e => setFormData({...formData, dosageInstructions: e.target.value})} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div>
                     <p className="font-bold text-sm text-gray-800">Refill Reminder</p>
                     <p className="text-[10px] text-gray-400 font-medium">Auto-notify patient for refills</p>
                   </div>
                   <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded-lg accent-emerald-600 cursor-pointer" 
                    checked={formData.refillReminder} 
                    onChange={e => setFormData({...formData, refillReminder: e.target.checked})} 
                  />
                </div>
                <Button disabled={isSubmittingRx} type="submit" fullWidth className="mt-4 py-4"><HiOutlineDocumentPlus size={20} /> {isSubmittingRx ? 'Creating...' : 'Create Prescription'}</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
