
export interface User {
  id: string;
  name: string;
  pharmacyName: string;
  email: string;
}

export interface Drug {
  id: string;
  name: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
  createdAt: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'Cash' | 'POS' | 'Transfer';
  timestamp: number;
  synced: boolean;
}

export interface SaleItem {
  drugId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Prescription {
  id: string;
  patientName: string;
  drugs: PrescriptionDrug[];
  dosageInstructions: string;
  refillReminder: boolean;
  timestamp: number;
}

export interface PrescriptionDrug {
  drugId: string;
  name: string;
  quantity: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'sale' | 'inventory' | 'prescription';
  payload: any;
  timestamp: number;
}
