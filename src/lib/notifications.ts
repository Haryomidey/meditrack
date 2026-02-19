import { Drug, Prescription } from '../types';

const LOW_STOCK_PREFIX = 'mt_notify_low_stock';
const REFILL_PREFIX = 'mt_notify_refill';
const EXPIRING_PREFIX = 'mt_notify_expiring';
const EXPIRED_PREFIX = 'mt_notify_expired';
const EXPIRING_SOON_DAYS = 30;

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getHalfHourSlotKey = (): string => {
  const now = new Date();
  const slotMinutes = now.getMinutes() < 30 ? '00' : '30';
  return `${getTodayKey()}-${String(now.getHours()).padStart(2, '0')}-${slotMinutes}`;
};

const hasNotified = (key: string): boolean => {
  return localStorage.getItem(key) === '1';
};

const setNotified = (key: string): void => {
  localStorage.setItem(key, '1');
};

const sendNotification = async (title: string, body: string): Promise<void> => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        });
        return;
      }
    }

    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
    });
  } catch {
    // no-op
  }
};

export const requestNotificationPermission = async (): Promise<void> => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const processInventoryNotifications = async (inventory: Drug[]): Promise<void> => {
  const slot = getHalfHourSlotKey();

  for (const drug of inventory) {
    const isLow = drug.quantity <= drug.lowStockThreshold;
    if (!isLow) continue;

    const key = `${LOW_STOCK_PREFIX}:${drug.id}:${slot}`;
    if (hasNotified(key)) continue;

    await sendNotification(
      'Low Stock Alert',
      `${drug.name} is low (${drug.quantity} left, threshold ${drug.lowStockThreshold}).`,
    );

    setNotified(key);
  }
};

export const processRefillNotifications = async (prescriptions: Prescription[]): Promise<void> => {
  const slot = getHalfHourSlotKey();
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  for (const prescription of prescriptions) {
    if (!prescription.refillReminder || !prescription.nextRefillDate) continue;

    const refillAt = new Date(prescription.nextRefillDate);
    if (Number.isNaN(refillAt.getTime())) continue;
    if (refillAt.getTime() > endOfToday.getTime()) continue;

    const key = `${REFILL_PREFIX}:${prescription.id}:${slot}`;
    if (hasNotified(key)) continue;

    await sendNotification(
      'Refill Reminder',
      `${prescription.patientName} is due for a refill today.`,
    );

    setNotified(key);
  }
};

export const processExpiryNotifications = async (inventory: Drug[]): Promise<void> => {
  const slot = getHalfHourSlotKey();
  const today = getTodayKey();
  const now = new Date();
  const endOfSoonWindow = new Date(now.getTime() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);

  for (const drug of inventory) {
    const expiryAt = new Date(drug.expiryDate);
    if (Number.isNaN(expiryAt.getTime())) continue;

    if (expiryAt.getTime() < now.getTime()) {
      const dailyExpiredKey = `${EXPIRED_PREFIX}:${drug.id}:${today}`;
      if (hasNotified(dailyExpiredKey)) continue;

      await sendNotification(
        'Expired Product Alert',
        `${drug.name} has expired. Remove it from active stock.`,
      );

      setNotified(dailyExpiredKey);
      continue;
    }

    if (expiryAt.getTime() <= endOfSoonWindow.getTime()) {
      const expiringKey = `${EXPIRING_PREFIX}:${drug.id}:${slot}`;
      if (hasNotified(expiringKey)) continue;

      await sendNotification(
        'Expiry Warning',
        `${drug.name} is expiring soon (${expiryAt.toLocaleDateString()}).`,
      );

      setNotified(expiringKey);
    }
  }
};
