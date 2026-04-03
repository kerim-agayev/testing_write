'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/store/uiStore';

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; message: string; type: 'success' | 'error' | 'info' };
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded bg-[#1A1A1A] text-white text-sm max-w-[320px]',
        'animate-slide-up shadow-3'
      )}
    >
      {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-accent shrink-0" />}
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-danger shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={onDismiss} className="shrink-0 hover:opacity-70">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
