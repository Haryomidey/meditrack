
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button, Badge } from '../components/UI';
import { motion } from 'framer-motion';
import { 
  HiOutlineChevronLeft, 
  HiOutlinePencilSquare, 
  HiOutlineTrash, 
  HiOutlineCube,
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineScale,
  HiOutlineExclamationCircle
} from 'react-icons/hi2';

export const DrugDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inventory, sales } = useStore();

  const drug = inventory.find(d => d.id === id);

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
  const totalSalesCount = sales.filter(s => s.items.some(i => i.drugId === id)).length;
  const isLowStock = drug.quantity <= drug.lowStockThreshold;
  const isExpired = new Date(drug.expiryDate) < new Date();

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
          <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 active:scale-95 transition-transform">
            <HiOutlinePencilSquare size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl bg-red-50 shadow-sm border border-red-100 flex items-center justify-center text-red-600 active:scale-95 transition-transform">
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
                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Total Stock</p>
                <h2 className="text-5xl font-black">{drug.quantity}</h2>
                <p className="text-emerald-100 text-xs mt-2 font-bold uppercase">Pieces in unit</p>
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
            <h3 className="text-xl font-black text-gray-900 mt-1">${drug.sellingPrice.toFixed(2)}</h3>
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
              <span className="text-sm font-black text-gray-900">${drug.costPrice.toFixed(2)}</span>
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
          <Button fullWidth className="py-4">Record New Restock</Button>
        </div>
      </motion.div>
    </div>
  );
};
