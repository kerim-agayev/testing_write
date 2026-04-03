'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type SlideOverProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function SlideOver({ open, onClose, title, children }: SlideOverProps) {
  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[rgba(26,28,26,0.15)]"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-[380px] bg-surface-card',
          'shadow-[-12px_0_32px_rgba(26,28,26,0.08)] border-l border-border',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-[380px]'
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          {title && <h3 className="text-lg font-semibold text-txt-primary">{title}</h3>}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-hover"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto h-[calc(100%-65px)]">{children}</div>
      </div>
    </>
  );
}
