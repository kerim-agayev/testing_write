'use client';

import { cn } from '@/lib/utils/cn';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: 'accent' | 'primary';
  label?: string;
  className?: string;
};

export function Slider({ value, onChange, min = 0, max = 100, color = 'accent', label, className }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const trackColor = color === 'accent' ? 'var(--color-accent)' : 'var(--color-primary)';

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-txt-muted">{label}</span>
          <span className="font-mono text-sm font-medium text-txt-primary">{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${trackColor} ${percent}%, var(--border-color) ${percent}%)`,
        }}
      />
    </div>
  );
}
