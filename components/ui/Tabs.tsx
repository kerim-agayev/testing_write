'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type TabsProps = {
  tabs: Array<{ key: string; label: string; icon?: ReactNode; badge?: number }>;
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: 'page' | 'panel';
  className?: string;
};

export function Tabs({ tabs, activeTab, onTabChange, variant = 'page', className }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeIndex = tabs.findIndex(t => t.key === activeTab);
    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>('[data-tab-button]');
    const btn = buttons[activeIndex];
    if (btn) {
      setIndicator({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  if (variant === 'panel') {
    return (
      <div ref={containerRef} className={cn('relative flex gap-0.5 p-1 bg-surface-panel rounded-lg', className)}>
        {/* Sliding indicator */}
        <div
          className="absolute inset-y-1 rounded-md bg-surface-card shadow-1 transition-all duration-200 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.key}
            data-tab-button
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors z-10',
              activeTab === tab.key
                ? 'text-txt-primary'
                : 'text-txt-secondary hover:text-txt-primary'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge != null && tab.badge > 0 && (
              <span className="w-4 h-4 text-[9px] bg-[var(--color-danger)] text-white rounded-full flex items-center justify-center font-mono">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative flex border-b border-border', className)}>
      {/* Sliding underline */}
      <div
        className="absolute bottom-0 h-[2px] bg-primary transition-all duration-200 ease-out rounded-full"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.key}
          data-tab-button
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === tab.key
              ? 'text-txt-primary'
              : 'text-txt-secondary hover:text-txt-primary'
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge != null && tab.badge > 0 && (
            <span className="w-4 h-4 text-[9px] bg-[var(--color-danger)] text-white rounded-full flex items-center justify-center font-mono">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
