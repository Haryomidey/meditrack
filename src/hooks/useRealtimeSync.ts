import { useEffect } from 'react';
import { authStorage } from '../lib/api';
import { useStore } from '../store/useStore';

const getRealtimeWsUrl = (): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const baseWithoutApi = apiBase.replace(/\/api\/?$/, '');
  return baseWithoutApi.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws';
};

export const useRealtimeSync = (isAuthenticated: boolean): void => {
  const loadAllData = useStore((state) => state.loadAllData);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = authStorage.getAccessToken();
    if (!token) return;

    const wsUrl = `${getRealtimeWsUrl()}?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);

    let reloadTimer: number | null = null;
    const scheduleReload = () => {
      if (reloadTimer) window.clearTimeout(reloadTimer);
      reloadTimer = window.setTimeout(() => {
        void loadAllData();
      }, 250);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as { type?: string };
        if (message.type === 'data-updated') {
          scheduleReload();
        }
      } catch {
        // ignore malformed realtime payloads
      }
    };

    return () => {
      if (reloadTimer) window.clearTimeout(reloadTimer);
      socket.close();
    };
  }, [isAuthenticated, loadAllData]);
};