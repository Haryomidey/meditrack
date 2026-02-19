import { Schema, model, Types } from 'mongoose';

export interface IRefreshToken {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  deviceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date },
    deviceId: { type: String },
  },
  { timestamps: true },
);

export const RefreshTokenModel = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
