import { useEffect } from 'react';
import { Drug, Prescription } from '../types';
import {
  processExpiryNotifications,
  processImmediateLowStockNotifications,
  processInventoryNotifications,
  processRefillNotifications,
  requestNotificationPermission,
} from '../lib/notifications';

export const useNotifications = (
  isAuthenticated: boolean,
  inventory: Drug[],
  prescriptions: Prescription[],
): void => {
  useEffect(() => {
    if (!isAuthenticated) return;
    void requestNotificationPermission();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const runChecks = async () => {
      await processInventoryNotifications(inventory);
      await processExpiryNotifications(inventory);
      await processRefillNotifications(prescriptions);
    };

    void runChecks();
    const timer = window.setInterval(() => {
      void runChecks();
    }, 30 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [inventory, prescriptions, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void processImmediateLowStockNotifications(inventory);
  }, [inventory, isAuthenticated]);
};