import { Types } from 'mongoose';
import { DrugModel } from '../models/drug.model';
import { SaleModel } from '../models/sale.model';

interface Scope {
  pharmacyId: string;
  branchId?: string;
}

const scopeFilter = (scope: Scope) => ({
  pharmacyId: new Types.ObjectId(scope.pharmacyId),
  ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
});

const rangeFor = (period: 'daily' | 'weekly' | 'monthly') => {
  const now = new Date();
  const start = new Date(now);

  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  }
  if (period === 'weekly') {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  }
  if (period === 'monthly') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end: now };
};

export const salesSummary = async (scope: Scope, period: 'daily' | 'weekly' | 'monthly') => {
  const { start, end } = rangeFor(period);

  const sales = await SaleModel.find({
    ...scopeFilter(scope),
    timestamp: { $gte: start, $lte: end },
  });

  const revenue = sales.reduce((acc, sale) => acc + sale.totalRevenue, 0);
  const cost = sales.reduce((acc, sale) => acc + sale.totalCost, 0);

  const bestSellers = new Map<string, { name: string; quantity: number }>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.drugId.toString();
      const existing = bestSellers.get(key) ?? { name: item.name, quantity: 0 };
      existing.quantity += item.quantity;
      bestSellers.set(key, existing);
    }
  }

  const topDrugs = [...bestSellers.entries()]
    .map(([drugId, value]) => ({ drugId, ...value }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    period,
    start,
    end,
    transactions: sales.length,
    revenue,
    cost,
    profit: revenue - cost,
    bestSellingDrugs: topDrugs,
  };
};

export const lowStockReport = async (scope: Scope) => {
  return DrugModel.find({
    ...scopeFilter(scope),
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  });
};

export const expiringReport = async (scope: Scope, days = 90) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return DrugModel.find({
    ...scopeFilter(scope),
    expiryDate: { $lte: cutoff },
  });
};
