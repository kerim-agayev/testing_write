'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'standard' | 'underline';
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'standard', label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wide text-txt-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full text-[15px] text-txt-primary placeholder:text-txt-muted transition-all duration-200',
            variant === 'standard' &&
              'h-[42px] px-3.5 bg-surface-card border border-border rounded focus:border-primary focus:border-[1.5px] outline-none',
            variant === 'underline' &&
              'bg-transparent border-0 border-b border-border rounded-none px-2 py-1.5 text-[13px] font-medium focus:border-b-primary focus:border-b-[1.5px] outline-none',
            error && 'border-danger focus:border-danger',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
