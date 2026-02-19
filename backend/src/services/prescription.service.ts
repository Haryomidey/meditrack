import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { PrescriptionModel } from '../models/prescription.model';

interface Scope {
  pharmacyId: string;
  branchId?: string;
  actorId: string;
}

interface PrescriptionDrugInput {
  drugId: string;
  name: string;
  quantity: number;
  dosage: string;
}

interface CreatePrescriptionInput {
  patientName: string;
  drugs: PrescriptionDrugInput[];
  dosageInstructions: string;
  prescribingDoctor: string;
  refillReminder: boolean;
  nextRefillDate?: string;
  imageUrl?: string;
  timestamp?: string;
}

interface UpdatePrescriptionInput extends Partial<CreatePrescriptionInput> {}

const scopeFilter = (scope: Omit<Scope, 'actorId'>) => ({
  pharmacyId: new Types.ObjectId(scope.pharmacyId),
  ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
});

export const listPrescriptions = async (scope: Omit<Scope, 'actorId'>) => {
  return PrescriptionModel.find(scopeFilter(scope)).sort({ timestamp: -1 }).limit(500);
};

export const createPrescription = async (scope: Scope, input: CreatePrescriptionInput) => {
  const payload = {
    ...input,
    drugs: input.drugs.map((d) => ({ ...d, drugId: new Types.ObjectId(d.drugId) })),
    pharmacyId: new Types.ObjectId(scope.pharmacyId),
    ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
    createdBy: new Types.ObjectId(scope.actorId),
    timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
    ...(input.nextRefillDate ? { nextRefillDate: new Date(input.nextRefillDate) } : {}),
  };

  return PrescriptionModel.create(payload);
};

export const updatePrescription = async (scope: Scope, id: string, input: UpdatePrescriptionInput) => {
  const update: Record<string, unknown> = { ...input };

  if (input.drugs) {
    update.drugs = input.drugs.map((d) => ({ ...d, drugId: new Types.ObjectId(d.drugId) }));
  }
  if (input.timestamp) update.timestamp = new Date(input.timestamp);
  if (input.nextRefillDate) update.nextRefillDate = new Date(input.nextRefillDate);

  const record = await PrescriptionModel.findOneAndUpdate(
    {
      ...scopeFilter(scope),
      _id: new Types.ObjectId(id),
    },
    { $set: update },
    { new: true },
  );

  if (!record) {
    throw new AppError('Prescription not found', StatusCodes.NOT_FOUND);
  }

  return record;
};

export const deletePrescription = async (scope: Scope, id: string) => {
  const deleted = await PrescriptionModel.findOneAndDelete({
    ...scopeFilter(scope),
    _id: new Types.ObjectId(id),
  });

  if (!deleted) {
    throw new AppError('Prescription not found', StatusCodes.NOT_FOUND);
  }
};