'use client';

import { cn } from '@/lib/utils/cn';

type TabsProps = {
  tabs: Array<{ key: string; label: string }>;
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: 'page' | 'panel';
  className?: string;
};

export function Tabs({ tabs, activeTab, onTabChange, variant = 'page', className }: TabsProps) {
  if (variant === 'panel') {
    return (
      <div className={cn('flex gap-1 p-1', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'px-3 py-[5px] rounded text-xs font-medium transition-all duration-200',
              activeTab === tab.key
                ? 'bg-primary text-txt-on-primary'
                : 'text-txt-secondary hover:text-txt-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
            activeTab === tab.key
              ? 'text-txt-primary border-primary'
              : 'text-txt-secondary border-transparent hover:text-txt-primary'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
