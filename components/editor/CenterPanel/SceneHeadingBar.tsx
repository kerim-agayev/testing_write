'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useSceneData } from '@/hooks/useSceneData';
import { useSaveScene, useUpdateLocation } from '@/lib/api/hooks';
import { Save } from 'lucide-react';

const INT_EXT_OPTIONS = ['INT', 'EXT', 'INT_EXT'] as const;
const INT_EXT_LABELS: Record<string, string> = { INT: 'INT.', EXT: 'EXT.', INT_EXT: 'INT./EXT.' };
const TIME_OPTIONS = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'CONTINUOUS', 'LATER'];

export function SceneHeadingBar({ screenplayId }: { screenplayId: string }) {
  const activeSceneId = useEditorStore(s => s.activeSceneId);
  const { data: rawData } = useSceneData(screenplayId);
  const sceneData = rawData as { intExt?: string; location?: { id: string; name: string } | null; timeOfDay?: string | null; sceneNumber?: number } | undefined;
  const saveScene = useSaveScene(screenplayId);
  const updateLocation = useUpdateLocation(screenplayId);

  const [intExt, setIntExt] = useState('INT');
  const [locationName, setLocationName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('DAY');

  useEffect(() => {
    if (sceneData) {
      setIntExt(sceneData.intExt ?? 'INT');
      setLocationName(sceneData.location?.name ?? '');
      setTimeOfDay(sceneData.timeOfDay ?? 'DAY');
    }
  }, [sceneData, activeSceneId]);

  if (!activeSceneId) return null;

  const handleSaveIntExt = (val: string) => {
    setIntExt(val);
    saveScene.mutate({ sceneId: activeSceneId, data: { intExt: val } });
    if (sceneData?.location?.id) {
      updateLocation.mutate({ id: sceneData.location.id, data: { intExt: val } });
    }
  };

  const handleSaveTime = (val: string) => {
    setTimeOfDay(val);
    saveScene.mutate({ sceneId: activeSceneId, data: { timeOfDay: val } });
  };

  const handleSaveLocation = () => {
    if (!locationName.trim()) return;
    saveScene.mutate({ sceneId: activeSceneId, data: { locationName: locationName.trim().toUpperCase() } });
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--surface-panel)] max-w-[680px] mx-auto rounded-t">
      <select
        value={intExt}
        onChange={e => handleSaveIntExt(e.target.value)}
        className="text-xs font-mono font-bold bg-[var(--surface-card)] border border-[var(--border-color)] rounded px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none cursor-pointer text-[var(--text-primary)]"
      >
        {INT_EXT_OPTIONS.map(o => <option key={o} value={o}>{INT_EXT_LABELS[o]}</option>)}
      </select>

      <input
        type="text"
        value={locationName}
        onChange={e => setLocationName(e.target.value.toUpperCase())}
        onKeyDown={e => { if (e.key === 'Enter') handleSaveLocation(); }}
        placeholder="LOCATION NAME"
        className="flex-1 text-xs font-mono uppercase bg-transparent border-b border-[var(--border-color)] focus:border-[var(--color-primary)] focus:outline-none px-1 py-1 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
      />

      <button
        onClick={handleSaveLocation}
        disabled={saveScene.isPending}
        className="p-1.5 rounded hover:bg-[var(--surface-card)] transition-colors text-[var(--text-muted)] hover:text-[var(--color-primary)] disabled:opacity-50"
        title="Save location"
      >
        <Save className="w-3.5 h-3.5" />
      </button>

      <span className="text-[var(--text-muted)] font-mono text-xs">—</span>

      <select
        value={timeOfDay}
        onChange={e => handleSaveTime(e.target.value)}
        className="text-xs font-mono bg-[var(--surface-card)] border border-[var(--border-color)] rounded px-2 py-1.5 focus:border-[var(--color-primary)] focus:outline-none cursor-pointer text-[var(--text-primary)]"
      >
        {TIME_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      <span className="text-xs font-mono text-[var(--text-muted)] ml-1">
        S.{sceneData?.sceneNumber ?? '—'}
      </span>
    </div>
  );
}
