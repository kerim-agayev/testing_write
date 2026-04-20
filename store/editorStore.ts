import { create } from 'zustand';

type EditorStore = {
  screenplayId: string | null;
  activeSceneId: string | null;
  activeEpisodeId: string | null;

  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: 'story' | 'notes' | 'mentor';

  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;

  slideOverCharacterId: string | null;

  setScreenplayId: (id: string) => void;
  setActiveScene: (sceneId: string) => void;
  setActiveEpisode: (episodeId: string) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  openCharacterSlideOver: (characterId: string) => void;
  closeCharacterSlideOver: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelTab: (tab: 'story' | 'notes' | 'mentor') => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  screenplayId: null,
  activeSceneId: null,
  activeEpisodeId: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  rightPanelTab: 'story',
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,
  slideOverCharacterId: null,

  setScreenplayId: (id) => set((s) => s.screenplayId !== id ? { screenplayId: id, activeSceneId: null } : { screenplayId: id }),
  setActiveScene: (sceneId) => set({ activeSceneId: sceneId }),
  setActiveEpisode: (episodeId) => set({ activeEpisodeId: episodeId }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
  openCharacterSlideOver: (characterId) => set({ slideOverCharacterId: characterId }),
  closeCharacterSlideOver: () => set({ slideOverCharacterId: null }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
}));
