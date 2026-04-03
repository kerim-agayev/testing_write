'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useMarkNotificationsRead } from '@/lib/api/hooks';
import Link from 'next/link';

type Notification = {
  id: string;
  type: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const resp = data as { notifications?: Notification[]; unreadCount?: number } | undefined;
  const notifications = resp?.notifications || [];
  const unreadCount = resp?.unreadCount || 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      markRead.mutate();
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-hover transition-colors relative"
      >
        <Bell className="w-4 h-4 text-txt-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-danger)] text-white text-[9px] rounded-full flex items-center justify-center font-mono font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 glass rounded-lg overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-[var(--border-color)] flex items-center justify-between">
            <span className="text-xs font-semibold text-txt-primary">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markRead.mutate()}
                className="text-[10px] text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-txt-muted text-center py-6">No notifications</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div key={n.id} className={`px-3 py-2.5 border-b border-[var(--border-color)] last:border-0 ${!n.isRead ? 'bg-[var(--surface-hover)]' : ''}`}>
                  {n.linkUrl ? (
                    <Link href={n.linkUrl} onClick={() => setOpen(false)} className="block">
                      <p className="text-xs text-txt-primary leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-txt-muted mt-0.5">{formatTime(n.createdAt)}</p>
                    </Link>
                  ) : (
                    <>
                      <p className="text-xs text-txt-primary leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-txt-muted mt-0.5">{formatTime(n.createdAt)}</p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
