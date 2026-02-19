import { Schema, model, Types } from 'mongoose';

export type SyncType = 'SALE' | 'DRUG_UPDATE' | 'PRESCRIPTION';

export interface ISyncRecord {
  _id: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  deviceId: string;
  opKey: string;
  type: SyncType;
  timestamp: Date;
  status: 'applied' | 'conflict' | 'failed';
  result?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const syncRecordSchema = new Schema<ISyncRecord>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    deviceId: { type: String, required: true },
    opKey: { type: String, required: true },
    type: { type: String, enum: ['SALE', 'DRUG_UPDATE', 'PRESCRIPTION'], required: true },
    timestamp: { type: Date, required: true },
    status: { type: String, enum: ['applied', 'conflict', 'failed'], required: true },
    result: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

syncRecordSchema.index({ pharmacyId: 1, deviceId: 1, opKey: 1 }, { unique: true });

export const SyncRecordModel = model<ISyncRecord>('SyncRecord', syncRecordSchema);
