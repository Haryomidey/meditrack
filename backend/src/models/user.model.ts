import { Schema, model, Types } from 'mongoose';

export type UserRole = 'Owner' | 'Pharmacist' | 'SalesStaff';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  pharmacyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Owner', 'Pharmacist', 'SalesStaff'], required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', userSchema);
