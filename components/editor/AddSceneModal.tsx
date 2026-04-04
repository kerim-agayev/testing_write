'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditorStore } from '@/store/editorStore';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

const INT_EXT_OPTIONS = ['INT.', 'EXT.', 'INT./EXT.'];
const TIME_OPTIONS = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'CONTINUOUS', 'LATER'];

interface AddSceneModalProps {
  screenplayId: string;
  onClose: () => void;
}

export function AddSceneModal({ screenplayId, onClose }: AddSceneModalProps) {
  const t = useTranslations('editor.leftPanel');
  const tc = useTranslations('common');
  const [intExt, setIntExt] = useState('INT.');
  const [location, setLocation] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('DAY');
  const qc = useQueryClient();
  const { setActiveScene } = useEditorStore();

  const createScene = useMutation({
    mutationFn: async () => {
      const intExtDb = intExt === 'INT.' ? 'INT' : intExt === 'EXT.' ? 'EXT' : 'INT_EXT';
      const res = await fetch(`/api/screenplays/${screenplayId}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intExt: intExtDb,
          locationName: location.toUpperCase().trim() || 'LOCATION',
          timeOfDay,
        }),
      });
      if (!res.ok) throw new Error('Scene create failed');
      return res.json();
    },
    onSuccess: (newScene) => {
      qc.invalidateQueries({ queryKey: ['scenes', screenplayId] });
      setActiveScene(newScene.id);
      onClose();
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,28,26,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl shadow-3 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{t('newScene') || 'New Scene'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--surface-panel)] transition-colors">
            <X size={16} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* INT/EXT */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Type</label>
          <div className="flex gap-2">
            {INT_EXT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setIntExt(opt)}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-md border transition-all ${
                  intExt === opt
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value.toUpperCase())}
            placeholder="COFFEE SHOP, HOUSE, STREET..."
            autoFocus
            className="w-full text-sm font-mono uppercase p-2.5 bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md focus:border-[var(--color-primary)] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* Time */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Time</label>
          <div className="flex flex-wrap gap-1.5">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setTimeOfDay(opt)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-all ${
                  timeOfDay === opt
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-5 p-3 bg-[var(--surface-panel)] rounded-md border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-muted)] mb-1">Preview:</p>
          <p className="font-mono text-sm font-bold text-[var(--text-primary)] uppercase">
            {intExt} {location || 'LOCATION'} — {timeOfDay}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-[var(--border-color)] rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-panel)] transition-colors">
            {tc('cancel')}
          </button>
          <button
            onClick={() => createScene.mutate()}
            disabled={createScene.isPending}
            className="flex-1 py-2.5 text-sm bg-[var(--color-primary)] text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-all font-medium"
          >
            {createScene.isPending ? tc('loading') : tc('create')}
          </button>
        </div>
      </div>
    </div>
  );
}
