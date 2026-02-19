import { Schema, model, Types } from 'mongoose';

interface IPurchaseHistory {
  invoiceNo: string;
  amount: number;
  date: Date;
  paid: boolean;
}

export interface ISupplier {
  _id: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  outstandingPayments: number;
  performanceScore: number;
  purchaseHistory: IPurchaseHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const purchaseHistorySchema = new Schema<IPurchaseHistory>(
  {
    invoiceNo: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    paid: { type: Boolean, default: false },
  },
  { _id: false },
);

const supplierSchema = new Schema<ISupplier>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    outstandingPayments: { type: Number, default: 0, min: 0 },
    performanceScore: { type: Number, default: 100, min: 0, max: 100 },
    purchaseHistory: { type: [purchaseHistorySchema], default: [] },
  },
  { timestamps: true },
);

supplierSchema.index({ pharmacyId: 1, name: 1 }, { unique: true });

export const SupplierModel = model<ISupplier>('Supplier', supplierSchema);
