import React from 'react';
import { Card, Badge } from '../components/UI';
import { useStore } from '../store/useStore';
import { HiOutlineClock, HiOutlineDocumentText, HiOutlineShoppingCart } from 'react-icons/hi2';
import { formatNaira } from '../lib/currency';

export const History: React.FC = () => {
  const { sales } = useStore();
  const orderedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Sales History</h2>
        <Badge variant="info">{orderedSales.length} Records</Badge>
      </div>

      <div className="space-y-4">
        {orderedSales.map((sale) => (
          <Card key={sale.id} className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900">Sale #{sale.id.slice(0, 8)}</h3>
                <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-1">
                  <HiOutlineClock size={13} />
                  {new Date(sale.timestamp).toLocaleString()} • {sale.paymentMethod}
                </p>
              </div>
              <p className="text-lg font-black text-emerald-600">{formatNaira(sale.total)}</p>
            </div>

            <div className="p-4 space-y-3">
              {sale.items.map((item, index) => (
                <div key={`${sale.id}-${item.drugId}-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
                      <HiOutlineDocumentText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-[11px] font-medium text-gray-500">
                        Qty {item.quantity} x {formatNaira(item.price)}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900">{formatNaira(item.quantity * item.price)}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {orderedSales.length === 0 && (
          <Card className="text-center py-12">
            <HiOutlineShoppingCart size={42} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">No sales history yet</p>
          </Card>
        )}
      </div>
    </div>
  );
};
