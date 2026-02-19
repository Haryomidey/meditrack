import { create } from 'zustand';
import { Drug, Prescription, Sale, User } from '../types';
import { apiRequest, authStorage, StoredUser } from '../lib/api';

interface AddDrugInput {
  name: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
}

interface AddSaleInput {
  items: Array<{ drugId: string; quantity: number }>;
  paymentMethod: 'Cash' | 'POS' | 'Transfer';
}

interface AddPrescriptionInput {
  patientName: string;
  dosageInstructions: string;
  prescribingDoctor: string;
  refillReminder: boolean;
  nextRefillDate?: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface AppState {
  user: User | null;
  isOnline: boolean;
  inventory: Drug[];
  sales: Sale[];
  prescriptions: Prescription[];
  isLoading: boolean;
  error: string | null;

  setOnline: (status: boolean) => void;
  clearError: () => void;

  hydrateSession: () => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    pharmacyName: string;
    branchName: string;
    branchCode: string;
  }) => Promise<void>;
  logout: () => Promise<void>;

  loadInventory: () => Promise<void>;
  addDrug: (drug: AddDrugInput) => Promise<void>;
  updateDrug: (id: string, drug: Partial<AddDrugInput>) => Promise<void>;
  deleteDrug: (id: string) => Promise<void>;

  addSale: (sale: AddSaleInput) => Promise<void>;
  loadSales: () => Promise<void>;

  addPrescription: (prescription: AddPrescriptionInput) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  loadPrescriptions: () => Promise<void>;

  loadAllData: () => Promise<void>;
}

const toUser = (user: StoredUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  pharmacyName: user.pharmacyName || 'MediTrack',
});

const persistSession = (payload: AuthResponse, pharmacyName = 'MediTrack') => {
  authStorage.setSession({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      pharmacyName,
    },
  });

  return toUser({
    id: payload.user.id,
    name: payload.user.name,
    email: payload.user.email,
    pharmacyName,
  });
};

const mapDrug = (drug: any): Drug => ({
  id: String(drug._id),
  name: drug.name,
  category: drug.category,
  batchNumber: drug.batchNumber,
  expiryDate: drug.expiryDate,
  quantity: Number(drug.quantity),
  costPrice: Number(drug.costPrice),
  sellingPrice: Number(drug.sellingPrice),
  lowStockThreshold: Number(drug.lowStockThreshold ?? 0),
  createdAt: new Date(drug.createdAt).getTime(),
});

const mapSale = (sale: any): Sale => ({
  id: String(sale._id),
  items: (sale.items || []).map((item: any) => ({
    drugId: String(item.drugId),
    name: item.name,
    quantity: Number(item.quantity),
    price: Number(item.sellingPrice),
  })),
  total: Number(sale.totalRevenue ?? 0),
  paymentMethod: sale.paymentMethod,
  timestamp: new Date(sale.timestamp).getTime(),
  synced: true,
});

const mapPrescription = (rx: any): Prescription => ({
  id: String(rx._id),
  patientName: rx.patientName,
  dosageInstructions: rx.dosageInstructions,
  refillReminder: Boolean(rx.refillReminder),
  timestamp: new Date(rx.timestamp).getTime(),
  nextRefillDate: rx.nextRefillDate || undefined,
  drugs: (rx.drugs || []).map((d: any) => ({
    drugId: String(d.drugId),
    name: d.name,
    quantity: Number(d.quantity),
  })),
});

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isOnline: navigator.onLine,
  inventory: [],
  sales: [],
  prescriptions: [],
  isLoading: false,
  error: null,

  setOnline: (isOnline) => set({ isOnline }),
  clearError: () => set({ error: null }),

  hydrateSession: async () => {
    const stored = authStorage.getUser();
    if (!stored) {
      set({ user: null });
      return;
    }

    set({ user: toUser(stored) });

    try {
      await get().loadAllData();
    } catch {
      authStorage.clear();
      set({ user: null, inventory: [], sales: [], prescriptions: [] });
    }
  },

  signup: async (input) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiRequest<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      const user = persistSession(response, input.pharmacyName);
      set({ user });
      await get().loadAllData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Signup failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (input) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      const previousPharmacyName = authStorage.getUser()?.pharmacyName || 'MediTrack';
      const user = persistSession(response, previousPharmacyName);
      set({ user });
      await get().loadAllData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = authStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // noop
    } finally {
      authStorage.clear();
      set({ user: null, inventory: [], sales: [], prescriptions: [] });
    }
  },

  loadInventory: async () => {
    const response = await apiRequest<{ data: any[] }>('/drugs');
    set({ inventory: response.data.map(mapDrug) });
  },

  addDrug: async (drug) => {
    await apiRequest('/drugs', {
      method: 'POST',
      body: JSON.stringify(drug),
    });
    await get().loadInventory();
  },

  updateDrug: async (id, drug) => {
    await apiRequest(`/drugs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(drug),
    });
    await get().loadInventory();
  },

  deleteDrug: async (id) => {
    await apiRequest(`/drugs/${id}`, {
      method: 'DELETE',
    });
    await get().loadInventory();
  },

  addSale: async (sale) => {
    await apiRequest('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
    await Promise.all([get().loadSales(), get().loadInventory()]);
  },

  loadSales: async () => {
    const response = await apiRequest<{ data: any[] }>('/sales');
    set({ sales: response.data.map(mapSale) });
  },

  addPrescription: async (prescription) => {
    await apiRequest('/prescriptions', {
      method: 'POST',
      body: JSON.stringify({
        ...prescription,
        drugs: [],
      }),
    });
    await get().loadPrescriptions();
  },

  deletePrescription: async (id) => {
    await apiRequest(`/prescriptions/${id}`, {
      method: 'DELETE',
    });
    await get().loadPrescriptions();
  },

  loadPrescriptions: async () => {
    const response = await apiRequest<{ data: any[] }>('/prescriptions');
    set({ prescriptions: response.data.map(mapPrescription) });
  },

  loadAllData: async () => {
    set({ isLoading: true, error: null });

    try {
      await Promise.all([
        get().loadInventory(),
        get().loadSales(),
        get().loadPrescriptions(),
      ]);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load data' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));