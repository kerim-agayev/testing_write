import { cn } from '@/lib/utils/cn';

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: 32 | 40 | 44;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const sizeMap = { 32: 'w-8 h-8 text-xs', 40: 'w-10 h-10 text-sm', 44: 'w-11 h-11 text-sm' };

export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-[#EEF0FF] text-primary font-semibold flex items-center justify-center',
        sizeMap[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export function AvatarGroup({
  users,
  max = 3,
}: {
  users: Array<{ name: string; src?: string | null }>;
  max?: number;
}) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <div key={i} className="border-2 border-surface-card rounded-full">
          <Avatar name={u.name} src={u.src} size={32} />
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-8 h-8 rounded-full bg-surface-panel text-txt-secondary text-xs font-semibold flex items-center justify-center border-2 border-surface-card">
          +{overflow}
        </div>
      )}
    </div>
  );
}
