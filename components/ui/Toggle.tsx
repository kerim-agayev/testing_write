'use client';

import { cn } from '@/lib/utils/cn';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function Toggle({ checked, onChange, label, disabled, className }: ToggleProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer', disabled && 'opacity-40 cursor-not-allowed', className)}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-accent' : 'bg-border'
        )}
      >
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200',
            checked ? 'translate-x-[14px]' : 'translate-x-[2px]'
          )}
        />
      </button>
      {label && <span className="text-sm text-txt-primary">{label}</span>}
    </label>
  );
}
