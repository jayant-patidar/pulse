'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Info, Check } from 'lucide-react';
import { useNotifications, Notification } from '@/core/hooks/useNotifications';
import Link from 'next/link';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'ALERT': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-brand-500" />;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = (new Date(dateStr).getTime() - Date.now()) / 1000;
    
    if (Math.abs(diff) < 60) return 'just now';
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-brand-100 dark:border-brand-800/50 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-brand-100 dark:border-brand-800/50 flex items-center justify-between bg-brand-50/50 dark:bg-brand-900/10">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-brand-900 dark:text-brand-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-medium text-brand-500">{unreadCount} unread</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-brand-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-brand-50 dark:divide-brand-800/30">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    onClick={() => {
                      if (!notification.isRead) markAsRead(notification._id);
                    }}
                    className={`p-4 flex gap-3 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 cursor-pointer transition-colors relative group ${!notification.isRead ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link href={notification.link} className="block group-hover:underline">
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-brand-900 dark:text-brand-100' : 'text-brand-700 dark:text-brand-300'}`}>
                            {notification.title}
                          </p>
                        </Link>
                      ) : (
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-brand-900 dark:text-brand-100' : 'text-brand-700 dark:text-brand-300'}`}>
                          {notification.title}
                        </p>
                      )}
                      <p className="text-xs text-brand-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.body}
                      </p>
                      <span className="text-[10px] font-medium text-brand-400 mt-1.5 block uppercase tracking-wider">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification._id)}
                        className="shrink-0 text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-500 rounded-r-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-brand-100 dark:border-brand-800/50 text-center bg-brand-50/50 dark:bg-brand-900/10">
            <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
