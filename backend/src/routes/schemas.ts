import { z } from 'zod';

export const idParamsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    pharmacyName: z.string().min(2),
    branchName: z.string().min(2),
    branchCode: z.string().min(2),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    deviceId: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(1) }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const createDrugSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    batchNumber: z.string().min(1),
    expiryDate: z.string().min(1),
    costPrice: z.number().nonnegative(),
    sellingPrice: z.number().nonnegative(),
    quantity: z.number().int().nonnegative(),
    supplierId: z.string().optional(),
    supplierName: z.string().optional(),
    lowStockThreshold: z.number().int().nonnegative(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateDrugSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    batchNumber: z.string().min(1).optional(),
    expiryDate: z.string().min(1).optional(),
    costPrice: z.number().nonnegative().optional(),
    sellingPrice: z.number().nonnegative().optional(),
    quantity: z.number().int().nonnegative().optional(),
    supplierId: z.string().optional(),
    supplierName: z.string().optional(),
    lowStockThreshold: z.number().int().nonnegative().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export const createSaleSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        drugId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    ).min(1),
    paymentMethod: z.enum(['Cash', 'POS', 'Transfer']),
    timestamp: z.string().optional(),
    deviceId: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const patchSaleSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(['Cash', 'POS', 'Transfer']).optional(),
    timestamp: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export const createPrescriptionSchema = z.object({
  body: z.object({
    patientName: z.string().min(1),
    drugs: z.array(
      z.object({
        drugId: z.string().min(1),
        name: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
        dosage: z.string().min(1),
      }),
    ).default([]),
    dosageInstructions: z.string().min(1),
    prescribingDoctor: z.string().min(1),
    refillReminder: z.coerce.boolean().default(true),
    nextRefillDate: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updatePrescriptionSchema = z.object({
  body: z.object({
    patientName: z.string().min(1).optional(),
    drugs: z.array(
      z.object({
        drugId: z.string().min(1),
        name: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
        dosage: z.string().min(1),
      }),
    ).optional(),
    dosageInstructions: z.string().min(1).optional(),
    prescribingDoctor: z.string().min(1).optional(),
    refillReminder: z.coerce.boolean().optional(),
    nextRefillDate: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export const supplierSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    outstandingPayments: z.number().nonnegative().optional(),
    performanceScore: z.number().min(0).max(100).optional(),
    purchaseHistory: z.array(
      z.object({
        invoiceNo: z.string().min(1),
        amount: z.number().nonnegative(),
        date: z.string().min(1),
        paid: z.boolean(),
      }),
    ).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    outstandingPayments: z.number().nonnegative().optional(),
    performanceScore: z.number().min(0).max(100).optional(),
    purchaseHistory: z.array(
      z.object({
        invoiceNo: z.string().min(1),
        amount: z.number().nonnegative(),
        date: z.string().min(1),
        paid: z.boolean(),
      }),
    ).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export const syncSchema = z.object({
  body: z.object({
    queue: z.array(
      z.object({
        type: z.enum(['SALE', 'DRUG_UPDATE', 'PRESCRIPTION']),
        data: z.record(z.any()),
        timestamp: z.number().int().positive(),
        deviceId: z.string().min(1),
        opKey: z.string().optional(),
      }),
    ),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});
