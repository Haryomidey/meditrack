import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button, Badge, Input } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChevronLeft,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCube,
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineScale,
  HiOutlineExclamationCircle,
  HiOutlineXMark,
  HiOutlinePlus,
} from 'react-icons/hi2';
import { formatNaira } from '../lib/currency';

export const DrugDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inventory, sales, updateDrug, deleteDrug } = useStore();

  const drug = inventory.find((d) => d.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingRestock, setIsSavingRestock] = useState(false);

  const [restockQty, setRestockQty] = useState(0);
  const [editData, setEditData] = useState({
    name: '',
    category: '',
    batchNumber: '',
    expiryDate: '',
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    lowStockThreshold: 0,
  });

  useEffect(() => {
    if (!drug) return;

    setEditData({
      name: drug.name,
      category: drug.category,
      batchNumber: drug.batchNumber,
      expiryDate: drug.expiryDate.slice(0, 10),
      quantity: drug.quantity,
      costPrice: drug.costPrice,
      sellingPrice: drug.sellingPrice,
      lowStockThreshold: drug.lowStockThreshold,
    });
  }, [drug]);

  if (!drug) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
        <HiOutlineExclamationCircle size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-black text-gray-900 mb-2">Medication not found</h2>
        <p className="text-gray-500 mb-6">The item you're looking for might have been removed or doesn't exist.</p>
        <Button onClick={() => navigate('/inventory')} variant="secondary">Go back to Inventory</Button>
      </div>
    );
  }

  const profitMargin = ((drug.sellingPrice - drug.costPrice) / drug.sellingPrice) * 100;
  const totalSalesCount = sales.filter((s) => s.items.some((i) => i.drugId === id)).length;
  const isLowStock = drug.quantity <= drug.lowStockThreshold;
  const isExpired = new Date(drug.expiryDate) < new Date();

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm(`Delete ${drug.name}? This cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteDrug(drug.id);
      navigate('/inventory');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      await updateDrug(drug.id, editData);
      setIsEditing(false);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingRestock || restockQty <= 0) return;

    setIsSavingRestock(true);
    try {
      await updateDrug(drug.id, { quantity: drug.quantity + restockQty });
      setRestockQty(0);
      setIsRestocking(false);
    } finally {
      setIsSavingRestock(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          <HiOutlineChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 active:scale-95 transition-transform"
          >
            <HiOutlinePencilSquare size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-10 h-10 rounded-xl bg-red-50 shadow-sm border border-red-100 flex items-center justify-center text-red-600 active:scale-95 transition-transform disabled:opacity-50"
          >
            <HiOutlineTrash size={18} />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="px-1">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">{drug.category}</p>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">{drug.name}</h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-emerald-600 text-white border-none relative overflow-hidden p-6">
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Stock</p>
                <h2 className="text-5xl text-black">{drug.quantity}</h2>
                <p className="text-emerald-400 text-xs mt-2 font-bold uppercase">Pieces in unit</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {isLowStock && <Badge variant="danger" className="bg-red-500 text-white border-none">Low Stock</Badge>}
                {isExpired && <Badge variant="danger" className="bg-black text-white border-none">Expired</Badge>}
                {!isLowStock && !isExpired && <Badge variant="success" className="bg-white/20 text-white border-none">Optimal</Badge>}
              </div>
            </div>
            <HiOutlineCube className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10 -rotate-12" />
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <HiOutlineBanknotes size={18} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selling Price</p>
            </div>
            <h3 className="text-xl font-black text-gray-900 mt-1">{formatNaira(drug.sellingPrice)}</h3>
          </Card>
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <HiOutlineScale size={18} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profit Margin</p>
            </div>
            <h3 className="text-xl font-black text-emerald-600 mt-1">{profitMargin.toFixed(1)}%</h3>
          </Card>
        </div>

        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Drug Information</h3>
          <Card className="divide-y divide-gray-50 p-0">
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-bold text-gray-500">Batch Number</span>
              <span className="text-sm font-black text-gray-900">{drug.batchNumber}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-bold text-gray-500">Expiry Date</span>
              <span className={`text-sm font-black ${isExpired ? 'text-red-500' : 'text-gray-900'}`}>
                {new Date(drug.expiryDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-bold text-gray-500">Cost Price</span>
              <span className="text-sm font-black text-gray-900">{formatNaira(drug.costPrice)}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-bold text-gray-500">Stock Threshold</span>
              <span className="text-sm font-black text-gray-900">{drug.lowStockThreshold} Units</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-sm font-bold text-gray-500">Added On</span>
              <span className="text-sm font-black text-gray-900">
                {new Date(drug.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Card>
        </div>

        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Sales Performance</h3>
          <Card className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HiOutlineArrowTrendingUp size={24} />
            </div>
            <div>
              <h4 className="font-black text-gray-900">{totalSalesCount} Transactions</h4>
              <p className="text-xs font-bold text-gray-400">Total volume recorded since addition</p>
            </div>
          </Card>
        </div>

        <div className="pt-4">
          <Button fullWidth className="py-4" onClick={() => setIsRestocking(true)}>
            <HiOutlinePlus size={18} /> Record New Restock
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Edit Drug</h3>
                <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><HiOutlineXMark size={20} /></button>
              </div>
              <form onSubmit={handleEditSave} className="space-y-4">
                <Input label="Drug Name" required value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Category" required value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} />
                  <Input label="Batch #" required value={editData.batchNumber} onChange={e => setEditData({ ...editData, batchNumber: e.target.value })} />
                </div>
                <Input className="text-sm" label="Expiry Date" type="date" required value={editData.expiryDate} onChange={e => setEditData({ ...editData, expiryDate: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Stock Qty" type="number" required value={editData.quantity} onChange={e => setEditData({ ...editData, quantity: parseInt(e.target.value, 10) || 0 })} />
                  <Input label="Low Alert" type="number" required value={editData.lowStockThreshold} onChange={e => setEditData({ ...editData, lowStockThreshold: parseInt(e.target.value, 10) || 0 })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Cost (NGN)" type="number" step="0.01" required value={editData.costPrice} onChange={e => setEditData({ ...editData, costPrice: parseFloat(e.target.value) || 0 })} />
                  <Input label="Selling (NGN)" type="number" step="0.01" required value={editData.sellingPrice} onChange={e => setEditData({ ...editData, sellingPrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <Button disabled={isSavingEdit} type="submit" fullWidth className="mt-4">{isSavingEdit ? 'Saving...' : 'Save Changes'}</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRestocking && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsRestocking(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Record Restock</h3>
                <button onClick={() => setIsRestocking(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><HiOutlineXMark size={20} /></button>
              </div>
              <form onSubmit={handleRestock} className="space-y-4">
                <Input label="Current Stock" value={drug.quantity} disabled />
                <Input label="Quantity to Add" type="number" min="1" required value={restockQty} onChange={e => setRestockQty(parseInt(e.target.value, 10) || 0)} />
                <Button disabled={isSavingRestock || restockQty <= 0} type="submit" fullWidth className="mt-4">{isSavingRestock ? 'Recording...' : 'Record Restock'}</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};