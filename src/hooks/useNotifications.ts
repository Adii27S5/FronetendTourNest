import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import apiClient from '@/config/axios';
import { toast } from 'sonner';

// Global in-memory last check timestamp to avoid duplicate toasts
let lastCheckTime = 0;

export const useNotifications = (onUpdate?: (count: number) => void) => {
  const { user } = useAuth();

  const checkNotifications = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await apiClient.get(`/api/notifications/user/${user.email}`);
      const data = res.data || [];
      const unread = data.filter((n: any) => !n.read);

      // Show toast for new notifications since last check
      const now = Date.now();
      if (lastCheckTime > 0) {
        const newOnes = unread.filter((n: any) => {
          const created = new Date(n.createdAt).getTime();
          return created > lastCheckTime;
        });
        newOnes.forEach((n: any) => {
          if (n.type === 'SUCCESS') toast.success(n.message, { duration: 5000 });
          else if (n.type === 'WARNING') toast.warning(n.message, { duration: 5000 });
          else toast.info(n.message, { duration: 5000 });
        });
      }
      lastCheckTime = now;

      onUpdate?.(unread.length);
    } catch {
      // silent fail
    }
  }, [user?.email, onUpdate]);

  useEffect(() => {
    if (!user?.email) return;
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.email, checkNotifications]);

  return { checkNotifications };
};
