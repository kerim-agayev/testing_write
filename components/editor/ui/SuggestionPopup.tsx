'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export interface SuggestionItem {
  id: string;
  label: string;
}

interface Props {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
}

export const SuggestionPopup = forwardRef<
  { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
  Props
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!items || items.length === 0) return null;

  return (
    <div
      className="z-[100] bg-[var(--surface-card)] border border-[var(--border-color)]
                 rounded-lg shadow-xl overflow-hidden min-w-[140px] max-w-[260px]
                 font-mono text-sm"
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            selectItem(index);
          }}
          className={`block w-full text-left px-3 py-1.5 transition-colors ${
            index === selectedIndex
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--text-primary)] hover:bg-[var(--surface-panel)]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
});

SuggestionPopup.displayName = 'SuggestionPopup';
