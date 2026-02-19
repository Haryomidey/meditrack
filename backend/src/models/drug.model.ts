import { Schema, model, Types } from 'mongoose';

export interface IDrug {
  _id: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  name: string;
  category: string;
  batchNumber: string;
  expiryDate: Date;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  supplierId?: Types.ObjectId;
  supplierName?: string;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const drugSchema = new Schema<IDrug>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    batchNumber: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String, trim: true },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 10 },
  },
  { timestamps: true },
);

drugSchema.index({ pharmacyId: 1, branchId: 1, name: 1, batchNumber: 1 }, { unique: true });

export const DrugModel = model<IDrug>('Drug', drugSchema);
