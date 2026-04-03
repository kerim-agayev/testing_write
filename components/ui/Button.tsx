'use client';

import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'standard' | 'ghost' | 'danger' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-primary-darkest to-primary text-txt-on-primary hover:from-primary-dark hover:to-[#3A3880] active:scale-[0.98]',
  standard:
    'bg-primary text-txt-on-primary hover:bg-primary-dark active:bg-primary-darkest',
  ghost:
    'bg-transparent border border-primary text-primary hover:bg-[#F0F0F9]',
  danger:
    'bg-transparent border border-danger text-danger hover:bg-danger hover:text-white',
  text: 'bg-transparent text-primary hover:underline p-0',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-[18px] py-[9px] text-sm',
  lg: 'px-5 py-2.5 text-[15px]',
};

export function Button({
  variant = 'standard',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded transition-all duration-200',
        variantStyles[variant],
        variant !== 'text' && sizeStyles[size],
        (disabled || loading) && 'opacity-40 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
