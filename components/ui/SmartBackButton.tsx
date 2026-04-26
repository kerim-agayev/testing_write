'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface Props {
  screenplayId: string;
  label?: string;
  className?: string;
}

export function SmartBackButton({ screenplayId, label = 'Geri', className }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/screenplay/${screenplayId}/edit`);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={className ?? 'flex items-center gap-1.5 text-sm text-txt-secondary hover:text-txt-primary transition-colors'}
    >
      <ChevronLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
