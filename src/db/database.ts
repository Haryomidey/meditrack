
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'meditrack_db';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('inventory')) {
        db.createObjectStore('inventory', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('prescriptions')) {
        db.createObjectStore('prescriptions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    },
  });
};
