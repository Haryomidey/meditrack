
import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { useStore } from '../store/useStore';
import { 
  HiOutlineArrowTrendingUp, 
  HiOutlineExclamationTriangle, 
  HiOutlineCalendar, 
  HiOutlineArrowRight,
  HiOutlinePlusCircle,
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineCube
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { inventory, sales } = useStore();
  const navigate = useNavigate();

  const today = new Date().setHours(0, 0, 0, 0);
  const todaysSales = sales.filter(s => s.timestamp >= today);
  const totalRevenue = todaysSales.reduce((acc, curr) => acc + curr.total, 0);
  
  const lowStockCount = inventory.filter(d => d.quantity <= d.lowStockThreshold).length;
  const expiringSoonCount = inventory.filter(d => {
    const expiry = new Date(d.expiryDate).getTime();
    const threeMonths = 90 * 24 * 60 * 60 * 1000;
    return expiry - Date.now() < threeMonths;
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-emerald-600 border-none text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">Revenue Today</p>
            <h2 className="text-3xl font-black">${totalRevenue.toFixed(2)}</h2>
            <div className="mt-4 flex gap-2">
               <Badge variant="success" className="bg-white/20 text-white border-none">+{todaysSales.length} Transactions</Badge>
            </div>
          </div>
          <HiOutlineArrowTrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-500/30 rotate-12" />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center text-center p-6 border-amber-100 bg-amber-50/30">
          <HiOutlineExclamationTriangle className="text-amber-600 mb-2" size={24} />
          <p className="text-xs font-bold text-gray-500 uppercase">Low Stock</p>
          <h3 className="text-2xl font-black text-amber-700">{lowStockCount}</h3>
        </Card>
        <Card className="flex flex-col items-center text-center p-6 border-red-100 bg-red-50/30">
          <HiOutlineCalendar className="text-red-600 mb-2" size={24} />
          <p className="text-xs font-bold text-gray-500 uppercase">Expiring</p>
          <h3 className="text-2xl font-black text-red-700">{expiringSoonCount}</h3>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Add Stock', icon: HiOutlinePlusCircle, to: '/inventory', color: 'emerald' },
            { label: 'New Sale', icon: HiOutlineShoppingBag, to: '/sales', color: 'blue' },
            { label: 'History', icon: HiOutlineClock, to: '/sales', color: 'purple' },
          ].map((action) => (
            <button 
              key={action.label}
              onClick={() => navigate(action.to)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${action.color}-100 flex items-center justify-center text-${action.color}-600 shadow-sm border border-${action.color}-200 group-active:scale-90 transition-transform`}>
                <action.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase text-gray-600">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Inventory</h3>
          <button onClick={() => navigate('/inventory')} className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            View All <HiOutlineArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {inventory.slice(0, 3).map((drug) => (
            <Card key={drug.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <HiOutlineCube size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{drug.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase font-medium">{drug.category} • {drug.batchNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600 text-sm">{drug.quantity} pcs</p>
                <Badge variant={drug.quantity <= drug.lowStockThreshold ? 'danger' : 'success'}>
                  {drug.quantity <= drug.lowStockThreshold ? 'Low' : 'Good'}
                </Badge>
              </div>
            </Card>
          ))}
          {inventory.length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <HiOutlineCube className="mx-auto mb-2 opacity-20" size={40} />
              <p className="text-sm font-medium">No inventory items yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
