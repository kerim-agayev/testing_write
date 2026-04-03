import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'film' | 'series' | 'protagonist' | 'antagonist' | 'supporting' | 'minor' | 'active' | 'pending' | 'inactive' | 'genre';

type BadgeProps = {
  variant: BadgeVariant;
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  film: 'bg-[#EEF0FF] text-primary border border-[#C5C3F0]',
  series: 'bg-[#E6F4F1] text-[#0F6E56] border border-[#9ED4C6]',
  protagonist: 'bg-[#FFF3E0] text-warning',
  antagonist: 'bg-[#FEECEC] text-danger',
  supporting: 'bg-[#EEF0FF] text-primary',
  minor: 'bg-surface-panel text-txt-secondary',
  active: 'bg-[#E6F4F1] text-[#0F6E56]',
  pending: 'bg-[#FEF3E7] text-warning',
  inactive: 'bg-surface-panel text-txt-muted',
  genre: 'bg-surface-panel text-txt-secondary border border-border',
};

export function Badge({ variant, children, selected, onClick, className }: BadgeProps) {
  const isInteractive = !!onClick;

  return (
    <span
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={cn(
        'inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-semibold uppercase tracking-[0.06em]',
        variantStyles[variant],
        variant === 'genre' && selected && 'bg-[#EEF0FF] text-primary border-primary',
        variant === 'genre' && 'text-[13px] font-medium normal-case tracking-normal px-3 py-[5px]',
        isInteractive && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
    >
      {children}
    </span>
  );
}
