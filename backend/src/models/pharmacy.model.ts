import { Schema, model, Types } from 'mongoose';

export interface IPharmacy {
  _id: Types.ObjectId;
  name: string;
  ownerUserId?: Types.ObjectId;
  settings: {
    defaultLowStockThreshold: number;
    expiryAlertDays: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    name: { type: String, required: true, trim: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    settings: {
      defaultLowStockThreshold: { type: Number, default: 10, min: 0 },
      expiryAlertDays: { type: Number, default: 90, min: 0 },
    },
  },
  { timestamps: true },
);

export const PharmacyModel = model<IPharmacy>('Pharmacy', pharmacySchema);
