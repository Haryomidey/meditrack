import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { SaleModel } from '../models/sale.model';
import { adjustStock } from './drug.service';

interface Scope {
  pharmacyId: string;
  branchId?: string;
  actorId: string;
}

interface SaleItemInput {
  drugId: string;
  quantity: number;
}

interface CreateSaleInput {
  items: SaleItemInput[];
  paymentMethod: 'Cash' | 'POS' | 'Transfer';
  timestamp?: string;
  deviceId?: string;
}

interface PatchSaleInput {
  paymentMethod?: 'Cash' | 'POS' | 'Transfer';
  timestamp?: string;
}

const scopeFilter = (scope: Omit<Scope, 'actorId'>) => ({
  pharmacyId: new Types.ObjectId(scope.pharmacyId),
  ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
});

export const listSales = async (scope: Omit<Scope, 'actorId'>) => {
  return SaleModel.find(scopeFilter(scope)).sort({ timestamp: -1 }).limit(500);
};

export const createSale = async (scope: Scope, input: CreateSaleInput) => {
  if (!input.items.length) {
    throw new AppError('Sale must include at least one item', StatusCodes.BAD_REQUEST);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const saleItems: Array<{
      drugId: Types.ObjectId;
      name: string;
      quantity: number;
      costPrice: number;
      sellingPrice: number;
    }> = [];

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new AppError('Quantity must be greater than zero', StatusCodes.BAD_REQUEST);
      }

      const drug = await adjustStock(
        { pharmacyId: scope.pharmacyId, branchId: scope.branchId },
        new Types.ObjectId(item.drugId),
        -item.quantity,
        session,
      );

      saleItems.push({
        drugId: drug._id,
        name: drug.name,
        quantity: item.quantity,
        costPrice: drug.costPrice,
        sellingPrice: drug.sellingPrice,
      });
    }

    const totalRevenue = saleItems.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
    const totalCost = saleItems.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);

    const sale = await SaleModel.create(
      [
        {
          pharmacyId: new Types.ObjectId(scope.pharmacyId),
          ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
          items: saleItems,
          paymentMethod: input.paymentMethod,
          totalRevenue,
          totalCost,
          syncedFromDeviceId: input.deviceId,
          timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
          createdBy: new Types.ObjectId(scope.actorId),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return sale[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const patchSale = async (scope: Scope, saleId: string, input: PatchSaleInput) => {
  const sale = await SaleModel.findOneAndUpdate(
    {
      ...scopeFilter(scope),
      _id: new Types.ObjectId(saleId),
    },
    {
      $set: {
        ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
        ...(input.timestamp ? { timestamp: new Date(input.timestamp) } : {}),
      },
    },
    { new: true },
  );

  if (!sale) {
    throw new AppError('Sale not found', StatusCodes.NOT_FOUND);
  }

  return sale;
};
