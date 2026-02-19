import { Schema, model, Types } from 'mongoose';

interface IPrescriptionDrug {
  drugId: Types.ObjectId;
  name: string;
  quantity: number;
  dosage: string;
}

export interface IPrescription {
  _id: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  patientName: string;
  drugs: IPrescriptionDrug[];
  dosageInstructions: string;
  prescribingDoctor: string;
  refillReminder: boolean;
  nextRefillDate?: Date;
  imageUrl?: string;
  timestamp: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionDrugSchema = new Schema<IPrescriptionDrug>(
  {
    drugId: { type: Schema.Types.ObjectId, ref: 'Drug', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    dosage: { type: String, required: true },
  },
  { _id: false },
);

const prescriptionSchema = new Schema<IPrescription>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    patientName: { type: String, required: true, trim: true },
    drugs: { type: [prescriptionDrugSchema], default: [] },
    dosageInstructions: { type: String, required: true },
    prescribingDoctor: { type: String, required: true },
    refillReminder: { type: Boolean, default: true },
    nextRefillDate: { type: Date },
    imageUrl: { type: String },
    timestamp: { type: Date, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const PrescriptionModel = model<IPrescription>('Prescription', prescriptionSchema);
