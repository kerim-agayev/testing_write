'use client';

import { useQuery } from '@tanstack/react-query';
import { useEditorStore } from '@/store/editorStore';
import { get } from '@/lib/api/client';

export function useSceneData(screenplayId: string) {
  const activeSceneId = useEditorStore(s => s.activeSceneId);

  return useQuery({
    queryKey: ['scene-data', activeSceneId],
    queryFn: () => get(`/screenplays/${screenplayId}/scenes/${activeSceneId}`),
    enabled: !!activeSceneId && !!screenplayId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}
