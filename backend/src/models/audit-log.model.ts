import { Schema, model, Types } from 'mongoose';

export interface IAuditLog {
  _id: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  actorId: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AuditLogModel = model<IAuditLog>('AuditLog', auditLogSchema);
