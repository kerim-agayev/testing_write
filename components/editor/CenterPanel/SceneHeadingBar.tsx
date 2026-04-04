'use client';

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useEditorStore } from '@/store/editorStore';
import { useSceneData } from '@/hooks/useSceneData';

const INT_EXT_OPTIONS = ['INT.', 'EXT.', 'INT./EXT.'];
const TIME_OPTIONS = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'CONTINUOUS', 'LATER'];

export function SceneHeadingBar({ screenplayId }: { screenplayId: string }) {
  const activeSceneId = useEditorStore(s => s.activeSceneId);
  const { data: rawData } = useSceneData(screenplayId);
  const sceneData = rawData as { intExt?: string; location?: { name: string } | null; timeOfDay?: string | null; sceneNumber?: number } | undefined;

  const [intExt, setIntExt] = useState('INT.');
  const [location, setLocation] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('DAY');

  useEffect(() => {
    if (sceneData) {
      const map: Record<string, string> = { INT: 'INT.', EXT: 'EXT.', INT_EXT: 'INT./EXT.' };
      setIntExt(map[sceneData.intExt ?? 'INT'] ?? 'INT.');
      setLocation(sceneData.location?.name ?? '');
      setTimeOfDay(sceneData.timeOfDay ?? 'DAY');
    }
  }, [sceneData, activeSceneId]);

  const save = useDebouncedCallback(async (updates: Record<string, string>) => {
    if (!activeSceneId) return;
    await fetch(`/api/screenplays/${screenplayId}/scenes/${activeSceneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, 500);

  if (!activeSceneId) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--surface-base)] max-w-[680px] mx-auto rounded-t">
      <select
        value={intExt}
        onChange={e => {
          setIntExt(e.target.value);
          const dbMap: Record<string, string> = { 'INT.': 'INT', 'EXT.': 'EXT', 'INT./EXT.': 'INT_EXT' };
          save({ intExt: dbMap[e.target.value] });
        }}
        className="text-xs font-mono font-bold bg-[var(--surface-card)] border border-[var(--border-color)] rounded px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none cursor-pointer text-[var(--text-primary)]"
      >
        {INT_EXT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      <input
        type="text"
        value={location}
        onChange={e => { const v = e.target.value.toUpperCase(); setLocation(v); save({ locationName: v }); }}
        placeholder="LOCATION"
        className="flex-1 text-xs font-mono uppercase bg-transparent border-b border-[var(--border-color)] focus:border-[var(--color-primary)] focus:outline-none px-1 py-1 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
      />

      <span className="text-[var(--text-muted)] font-mono text-xs">—</span>

      <select
        value={timeOfDay}
        onChange={e => { setTimeOfDay(e.target.value); save({ timeOfDay: e.target.value }); }}
        className="text-xs font-mono bg-[var(--surface-card)] border border-[var(--border-color)] rounded px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none cursor-pointer text-[var(--text-primary)]"
      >
        {TIME_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      <span className="text-xs font-mono text-[var(--text-muted)] ml-1 hidden sm:block">
        S.{sceneData?.sceneNumber ?? '—'}
      </span>
    </div>
  );
}
