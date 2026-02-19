import { useEffect } from 'react';
import { Drug, Prescription } from '../types';
import {
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
    void processInventoryNotifications(inventory);
  }, [inventory, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void processRefillNotifications(prescriptions);
  }, [prescriptions, isAuthenticated]);
};
