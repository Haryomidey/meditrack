import { Schema, model, Types } from 'mongoose';

export type PaymentMethod = 'Cash' | 'POS' | 'Transfer';

interface ISaleItem {
  drugId: Types.ObjectId;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
}

export interface ISale {
  _id: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  items: ISaleItem[];
  paymentMethod: PaymentMethod;
  totalRevenue: number;
  totalCost: number;
  syncedFromDeviceId?: string;
  timestamp: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    drugId: { type: Schema.Types.ObjectId, ref: 'Drug', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const saleSchema = new Schema<ISale>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    items: { type: [saleItemSchema], default: [] },
    paymentMethod: { type: String, enum: ['Cash', 'POS', 'Transfer'], required: true },
    totalRevenue: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    syncedFromDeviceId: { type: String },
    timestamp: { type: Date, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const SaleModel = model<ISale>('Sale', saleSchema);
