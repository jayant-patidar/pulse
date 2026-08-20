'use client';

import { api } from '@/core/lib/api-client';
import { useAuth } from '@/core/providers/auth-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface Notification {
  _id: string;
  title: string;
  body: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  const orgId = user?.orgId;

  // Fetch initial history
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', orgId],
    queryFn: async () => {
      const res = await api.get<any>(`/root/notifications?organizationId=${orgId}`);
      return Array.isArray(res) ? res : (res?.data || []);
    },
    enabled: !!user && !!orgId,
  });

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket Gateway
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    
    const newSocket = io(socketUrl, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time notifications');
    });

    newSocket.on('notification.new', (notification: Notification) => {
      // Show toast
      if (notification.type === 'ALERT') {
        toast.error(notification.title, { description: notification.body });
      } else if (notification.type === 'SUCCESS') {
        toast.success(notification.title, { description: notification.body });
      } else if (notification.type === 'WARNING') {
        toast.warning(notification.title, { description: notification.body });
      } else {
        toast(notification.title, { description: notification.body });
      }

      // Update query cache to increment bell counter
      queryClient.setQueryData(['notifications', orgId], (oldData: Notification[] | undefined) => {
        if (!oldData) return [notification];
        return [notification, ...oldData];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, orgId, queryClient]);

  const markAsRead = async (id: string) => {
    await api.patch(`/root/notifications/${id}/read`, { organizationId: orgId });
    queryClient.setQueryData(['notifications', orgId], (oldData: Notification[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(n => n._id === id ? { ...n, isRead: true } : n);
    });
  };

  const markAllAsRead = async () => {
    await api.patch(`/root/notifications/read-all`, { organizationId: orgId });
    queryClient.setQueryData(['notifications', orgId], (oldData: Notification[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(n => ({ ...n, isRead: true }));
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}
