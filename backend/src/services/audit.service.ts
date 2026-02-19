import { Types } from 'mongoose';
import { AuditLogModel } from '../models/audit-log.model';

interface CreateAuditLogInput {
  pharmacyId: string;
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (input: CreateAuditLogInput): Promise<void> => {
  await AuditLogModel.create({
    pharmacyId: new Types.ObjectId(input.pharmacyId),
    actorId: new Types.ObjectId(input.actorId),
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    metadata: input.metadata,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
};