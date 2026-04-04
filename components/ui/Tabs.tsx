'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Tab = { key: string; label: string; icon?: ReactNode; badge?: number };

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: 'pills' | 'underline' | 'page' | 'panel';
  className?: string;
};

export function Tabs({ tabs, activeTab, onTabChange, variant = 'pills', className }: TabsProps) {
  // Underline variant
  if (variant === 'underline' || variant === 'page') {
    return (
      <div className={cn('flex border-b border-[var(--border-color)] overflow-x-auto', className)}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 -mb-px',
              tab.key === activeTab
                ? 'border-[var(--color-primary)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
            )}
          >
            {tab.icon && <span className="opacity-70">{tab.icon}</span>}
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="ml-1.5 min-w-[18px] h-[18px] px-1 text-[10px] bg-[var(--color-danger)] text-white rounded-full flex items-center justify-center font-mono leading-none">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Pills variant (default) — sliding background
  const activeIdx = tabs.findIndex(t => t.key === activeTab);
  const pct = `${100 / tabs.length}%`;

  return (
    <div className={cn('relative p-1 bg-[var(--surface-panel)] rounded-lg border border-[var(--border-color)]', className)}>
      {/* Sliding highlight */}
      <div
        className="absolute top-1 bottom-1 bg-[var(--surface-card)] rounded-md shadow-sm transition-all duration-200 ease-in-out pointer-events-none"
        style={{
          left: `calc(${activeIdx} * ${pct} + 4px)`,
          width: `calc(${pct} - 8px)`,
        }}
      />
      <div className="relative flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 z-10',
              tab.key === activeTab
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.icon && <span className="opacity-70">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge != null && tab.badge > 0 && (
              <span className="min-w-[16px] h-4 px-1 text-[10px] bg-[var(--color-danger)] text-white rounded-full flex items-center justify-center font-mono">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
