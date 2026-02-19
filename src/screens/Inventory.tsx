
import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { useStore } from '../store/useStore';
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineFunnel, HiOutlineXMark, HiOutlineCheck } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Inventory: React.FC = () => {
  const { inventory, addDrug } = useStore();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', category: '', batchNumber: '', expiryDate: '', quantity: 0, costPrice: 0, sellingPrice: 0, lowStockThreshold: 5
  });

  const filteredInventory = inventory.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDrug(formData);
    setIsAdding(false);
    setFormData({ name: '', category: '', batchNumber: '', expiryDate: '', quantity: 0, costPrice: 0, sellingPrice: 0, lowStockThreshold: 5 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search medications..."
            className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl shadow-sm border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 active:bg-gray-50">
          <HiOutlineFunnel size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-gray-900">Inventory</h2>
        <Badge variant="info">{inventory.length} Total items</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredInventory.map((drug) => (
          <Card key={drug.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div onClick={() => navigate(`/inventory/${drug.id}`)} className="cursor-pointer">
                <h3 className="font-bold text-gray-900">{drug.name}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{drug.category}</p>
              </div>
              <Badge variant={drug.quantity <= drug.lowStockThreshold ? 'danger' : 'success'}>
                {drug.quantity} Left
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-50">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Batch</p>
                <p className="text-xs font-semibold text-gray-700">{drug.batchNumber}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Expiry</p>
                <p className={`text-xs font-semibold ${new Date(drug.expiryDate) < new Date() ? 'text-red-500' : 'text-gray-700'}`}>
                  {new Date(drug.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-lg font-black text-emerald-600">${drug.sellingPrice.toFixed(2)}</p>
              <button 
                onClick={() => navigate(`/inventory/${drug.id}`)}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase underline transition-colors"
              >
                View details
              </button>
            </div>
          </Card>
        ))}
        {filteredInventory.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <HiOutlineMagnifyingGlass className="mx-auto mb-2 opacity-10" size={64} />
            <p>No drugs found</p>
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAdding(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-emerald-600 text-white rounded-3xl shadow-xl flex items-center justify-center z-40 border-4 border-emerald-50"
      >
        <HiOutlinePlus size={32} />
      </motion.button>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Add New Drug</h3>
                <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><HiOutlineXMark size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <Input label="Drug Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                   <Input label="Batch #" required value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})} />
                </div>
                <Input label="Expiry Date" type="date" required value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Stock Qty" type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
                   <Input label="Low Alert" type="number" required value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: parseInt(e.target.value) || 0})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Cost ($)" type="number" step="0.01" required value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} />
                   <Input label="Selling ($)" type="number" step="0.01" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})} />
                </div>
                <Button type="submit" fullWidth className="mt-4"><HiOutlineCheck size={20} /> Save to Inventory</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
