import { Schema, model, Types } from 'mongoose';

export interface IBranch {
  _id: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  name: string;
  code: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true },
);

branchSchema.index({ pharmacyId: 1, code: 1 }, { unique: true });

export const BranchModel = model<IBranch>('Branch', branchSchema);
