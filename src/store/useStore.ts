import { create } from 'zustand';
import { User, Drug, Sale, Prescription, SyncQueueItem } from '../types';
import { initDB } from '../db/database';

interface AppState {
  user: User | null;
  isOnline: boolean;
  inventory: Drug[];
  sales: Sale[];
  prescriptions: Prescription[];
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setOnline: (status: boolean) => void;
  setLoading: (status: boolean) => void;
  
  // Inventory
  loadInventory: () => Promise<void>;
  addDrug: (drug: Drug) => Promise<void>;
  updateDrug: (drug: Drug) => Promise<void>;
  
  // Sales
  addSale: (sale: Sale) => Promise<void>;
  loadSales: () => Promise<void>;
  
  // Prescriptions
  addPrescription: (prescription: Prescription) => Promise<void>;
  loadPrescriptions: () => Promise<void>;
  
  // Seed
  seedData: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isOnline: navigator.onLine,
  inventory: [],
  sales: [],
  prescriptions: [],
  isLoading: false,

  setUser: (user) => set({ user }),
  setOnline: (isOnline) => set({ isOnline }),
  setLoading: (isLoading) => set({ isLoading }),

  loadInventory: async () => {
    const db = await initDB();
    const all = await db.getAll('inventory');
    set({ inventory: all });
  },

  addDrug: async (drug) => {
    const db = await initDB();
    await db.put('inventory', drug);
    const all = await db.getAll('inventory');
    set({ inventory: all });
  },

  updateDrug: async (drug) => {
    const db = await initDB();
    await db.put('inventory', drug);
    const all = await db.getAll('inventory');
    set({ inventory: all });
  },

  addSale: async (sale) => {
    const db = await initDB();
    await db.put('sales', sale);
    
    // Deduct inventory
    for (const item of sale.items) {
      const drug = await db.get('inventory', item.drugId);
      if (drug) {
        drug.quantity -= item.quantity;
        await db.put('inventory', drug);
      }
    }

    const allSales = await db.getAll('sales');
    const allInv = await db.getAll('inventory');
    set({ sales: allSales, inventory: allInv });

    if (!get().isOnline) {
      await db.put('syncQueue', {
        id: crypto.randomUUID(),
        type: 'sale',
        payload: sale,
        timestamp: Date.now()
      });
    }
  },

  loadSales: async () => {
    const db = await initDB();
    const all = await db.getAll('sales');
    set({ sales: all });
  },

  addPrescription: async (prescription) => {
    const db = await initDB();
    await db.put('prescriptions', prescription);
    const all = await db.getAll('prescriptions');
    set({ prescriptions: all });
  },

  loadPrescriptions: async () => {
    const db = await initDB();
    const all = await db.getAll('prescriptions');
    set({ prescriptions: all });
  },

  seedData: async () => {
    const db = await initDB();
    const existingInv = await db.getAll('inventory');
    
    if (existingInv.length > 0) return;

    // Seed Drugs
    const dummyDrugs: Drug[] = [
      { id: 'd1', name: 'Amoxicillin 500mg', category: 'Antibiotics', batchNumber: 'AMX-2024-01', expiryDate: '2025-12-01', quantity: 150, costPrice: 5.50, sellingPrice: 12.00, lowStockThreshold: 20, createdAt: Date.now() },
      { id: 'd2', name: 'Paracetamol 500mg', category: 'Analgesics', batchNumber: 'PCM-998', expiryDate: '2026-06-15', quantity: 500, costPrice: 1.20, sellingPrice: 3.50, lowStockThreshold: 50, createdAt: Date.now() },
      { id: 'd3', name: 'Metformin 850mg', category: 'Antidiabetic', batchNumber: 'MET-442', expiryDate: '2024-11-20', quantity: 15, costPrice: 8.00, sellingPrice: 18.50, lowStockThreshold: 20, createdAt: Date.now() },
      { id: 'd4', name: 'Atorvastatin 20mg', category: 'Statins', batchNumber: 'ATV-001', expiryDate: '2025-01-10', quantity: 80, costPrice: 15.00, sellingPrice: 35.00, lowStockThreshold: 10, createdAt: Date.now() },
      { id: 'd5', name: 'Cetirizine 10mg', category: 'Antihistamine', batchNumber: 'CET-331', expiryDate: '2026-03-22', quantity: 200, costPrice: 2.50, sellingPrice: 8.00, lowStockThreshold: 25, createdAt: Date.now() },
    ];

    for (const d of dummyDrugs) await db.put('inventory', d);

    // Seed Prescriptions
    const dummyPrescriptions: Prescription[] = [
      { id: 'p1', patientName: 'John Doe', drugs: [{ drugId: 'd1', name: 'Amoxicillin', quantity: 21 }], dosageInstructions: 'Take 1 capsule three times daily for 7 days.', refillReminder: true, timestamp: Date.now() - 86400000 },
      { id: 'p2', patientName: 'Alice Smith', drugs: [{ drugId: 'd2', name: 'Paracetamol', quantity: 10 }], dosageInstructions: 'Take 2 tablets every 6 hours as needed for pain.', refillReminder: false, timestamp: Date.now() - 172800000 },
    ];

    for (const pr of dummyPrescriptions) await db.put('prescriptions', pr);

    // Seed Sales
    const dummySales: Sale[] = [
      { id: 's1', items: [{ drugId: 'd2', name: 'Paracetamol 500mg', quantity: 2, price: 3.50 }], total: 7.00, paymentMethod: 'Cash', timestamp: Date.now() - 3600000, synced: true },
      { id: 's2', items: [{ drugId: 'd5', name: 'Cetirizine 10mg', quantity: 1, price: 8.00 }], total: 8.00, paymentMethod: 'POS', timestamp: Date.now() - 7200000, synced: true },
    ];

    for (const s of dummySales) await db.put('sales', s);

    await get().loadInventory();
    await get().loadSales();
    await get().loadPrescriptions();
  }
}));
