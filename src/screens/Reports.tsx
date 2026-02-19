
import React from 'react';
import { Card, Badge } from '../components/UI';
import { useStore } from '../store/useStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { HiOutlineArrowDownTray, HiOutlineDocumentText, HiOutlineShare } from 'react-icons/hi2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const Reports: React.FC = () => {
  const { sales } = useStore();

  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();
    
    const daySales = sales.filter(s => s.timestamp >= dayStart && s.timestamp <= dayEnd);
    const total = daySales.reduce((acc, curr) => acc + curr.total, 0);
    
    return { name: dayStr, total };
  }).reverse();

  const barData = {
    labels: salesByDay.map(d => d.name),
    datasets: [
      {
        label: 'Revenue',
        data: salesByDay.map(d => d.total),
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
    ],
  };

  const paymentMethods = {
    Cash: sales.filter(s => s.paymentMethod === 'Cash').length,
    POS: sales.filter(s => s.paymentMethod === 'POS').length,
    Transfer: sales.filter(s => s.paymentMethod === 'Transfer').length,
  };

  const doughnutData = {
    labels: ['Cash', 'POS', 'Transfer'],
    datasets: [
      {
        data: [paymentMethods.Cash, paymentMethods.POS, paymentMethods.Transfer],
        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: '700' }, color: '#9ca3af' } },
      y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10, weight: '700' }, color: '#9ca3af' } },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Reports</h2>
        <div className="flex gap-2">
           <button className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400"><HiOutlineShare size={18} /></button>
           <button className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400"><HiOutlineArrowDownTray size={18} /></button>
        </div>
      </div>

      <Card className="h-64 flex flex-col">
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Weekly Revenue</h3>
        <div className="flex-1 w-full">
          <Bar data={barData} options={commonOptions as any} />
        </div>
      </Card>

      <Card className="flex flex-col">
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Payment Methods</h3>
        <div className="flex items-center gap-6">
          <div className="h-40 w-40">
            <Doughnut data={doughnutData} options={{ ...commonOptions, scales: undefined } as any} />
          </div>
          <div className="flex-1 space-y-3">
            {doughnutData.labels.map((label, i) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[i] }} />
                  <span className="text-xs font-bold text-gray-600">{label}</span>
                </div>
                <span className="text-xs font-black">{doughnutData.datasets[0].data[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 ml-1">Recent Transactions</h3>
        <div className="space-y-3">
          {sales.slice(-5).reverse().map((sale) => (
            <Card key={sale.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <HiOutlineDocumentText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Sale #{sale.id.slice(0, 4)}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {new Date(sale.timestamp).toLocaleTimeString()} • {sale.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-600 text-sm">${sale.total.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
