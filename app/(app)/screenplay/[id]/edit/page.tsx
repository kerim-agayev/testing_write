'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useScreenplay, useScenes, useSaveScene, useDeleteScene, useCharacters, useMentorNotes } from '@/lib/api/hooks';
import { ApiError } from '@/lib/api/client';
import { useSceneData } from '@/hooks/useSceneData';
import { useEditorStore } from '@/store/editorStore';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PanelLeft, PanelRight, ChevronLeft, Share2, Download, Users, BarChart3, BookOpen, Plus, Film, Trash2, Flag, MessageSquare, MapPin } from 'lucide-react';
import { SceneKronotopBadges } from '@/components/editor/LeftPanel/SceneKronotopBadges';
import { SceneEmotionSelector } from '@/components/editor/LeftPanel/SceneEmotionSelector';
import { cn } from '@/lib/utils/cn';
import { ScreenplayEditor } from '@/components/editor/CenterPanel/ScreenplayEditor';
import { AddSceneModal } from '@/components/editor/AddSceneModal';
import { useDebouncedCallback } from 'use-debounce';
import type { ScreenplayFull } from '@/types/api';

const POLARITY_OPTIONS = [
  { value: 'POS_TO_POS', label: '+→+' },
  { value: 'POS_TO_NEG', label: '+→-' },
  { value: 'NEG_TO_POS', label: '-→+' },
  { value: 'NEG_TO_NEG', label: '-→-' },
  { value: 'NEUTRAL', label: '●' },
];

type SceneListItem = {
  id: string; sceneNumber: number; intExt: string;
  synopsis: string | null; timeOfDay: string | null;
  storyValueScore?: number | null;
  location?: { name: string } | null;
  sceneCharacters?: Array<{ character: { id: string; name: string } }>;
};

type SceneFull = {
  id: string; content: Record<string, unknown> | null;
  storyEvent?: string | null; valueShift?: string | null;
  polarityShift?: string | null; turnOn?: string | null;
  turningPoint?: boolean; storyValueScore?: number | null;
  synopsis?: string | null;
  characterArcs?: Array<{ characterId: string; externalScore: number; internalScore: number }>;
};

type CharacterItem = {
  id: string; name: string; roleType: string; isMajor: boolean;
};

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('editor');
  const tc = useTranslations('common');
  const { data: screenplayData, error: screenplayError } = useScreenplay(id);
  const screenplay = screenplayData as ScreenplayFull | undefined;
  const { data: scenesData } = useScenes(id);
  const scenes = (scenesData || []) as SceneListItem[];
  const { data: charsData } = useCharacters(id);
  const characters = (charsData || []) as CharacterItem[];

  // Redirect if unauthorized
  useEffect(() => {
    if (screenplayError instanceof ApiError && (screenplayError.status === 404 || screenplayError.status === 403)) {
      router.replace('/dashboard');
    }
  }, [screenplayError, router]);

  const saveScene = useSaveScene(id);
  const deleteSceneMutation = useDeleteScene(id);
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    activeSceneId, setActiveScene, setScreenplayId,
    leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel,
    rightPanelTab, setRightPanelTab, isSaving, lastSavedAt,
  } = useEditorStore();

  // Fetch full scene data via useSceneData (persists across scene switches)
  const { data: activeSceneRaw } = useSceneData(id);
  const activeScene = activeSceneRaw as SceneFull | undefined;
  const activeSceneListItem = scenes.find(s => s.id === activeSceneId);

  // Query param navigation from analytics chart clicks
  useEffect(() => {
    const targetScene = searchParams.get('scene');
    if (targetScene) setActiveScene(targetScene);
  }, [searchParams, setActiveScene]);

  // Story data form state
  const [storyEvent, setStoryEvent] = useState('');
  const [valueShift, setValueShift] = useState('');
  const [polarityShift, setPolarityShift] = useState('');
  const [turnOn, setTurnOn] = useState('');
  const [turningPoint, setTurningPoint] = useState(false);
  const [notes, setNotes] = useState('');
  const [sceneValue, setSceneValue] = useState(50);
  const [emotionStart, setEmotionStart] = useState<string | null>(null);
  const [emotionEnd, setEmotionEnd] = useState<string | null>(null);

  // Arc scores state
  const [arcScores, setArcScores] = useState<Record<string, { ext: number; int: number }>>({});

  // Mentor notes
  const { data: mentorNotesData } = useMentorNotes(activeSceneId || '');
  const mentorNotes = (mentorNotesData || []) as Array<{
    id: string; content: string; type: string; flagReason?: string;
    createdAt: string; mentor: { name: string };
  }>;

  // Sync form state when active scene data loads/changes
  useEffect(() => {
    if (activeScene) {
      setStoryEvent(activeScene.storyEvent || '');
      setValueShift(activeScene.valueShift || '');
      setPolarityShift(activeScene.polarityShift || '');
      setTurnOn(activeScene.turnOn || '');
      setTurningPoint(activeScene.turningPoint || false);
      setNotes(activeScene.synopsis || '');
      setSceneValue(activeScene.storyValueScore ?? 50);
      setEmotionStart((activeScene as { emotionStart?: string | null }).emotionStart ?? null);
      setEmotionEnd((activeScene as { emotionEnd?: string | null }).emotionEnd ?? null);
      const scores: Record<string, { ext: number; int: number }> = {};
      activeScene.characterArcs?.forEach(a => {
        scores[a.characterId] = { ext: a.externalScore, int: a.internalScore };
      });
      setArcScores(scores);
    } else {
      setStoryEvent(''); setValueShift(''); setPolarityShift('');
      setTurnOn(''); setTurningPoint(false); setNotes('');
      setSceneValue(50); setArcScores({}); setEmotionStart(null); setEmotionEnd(null);
    }
  }, [activeSceneId, activeScene]);

  useEffect(() => { setScreenplayId(id); }, [id, setScreenplayId]);

  // Auto-select first scene if none selected
  useEffect(() => {
    if (!activeSceneId && scenes.length > 0) {
      setActiveScene(scenes[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes.length]);

  const formatSavedTime = () => {
    if (isSaving) return t('autosave.saving');
    if (!lastSavedAt) return '';
    const s = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    if (s < 5) return t('autosave.saved', { time: '0s' });
    if (s < 60) return t('autosave.saved', { time: `${s}s` });
    return t('autosave.saved', { time: `${Math.floor(s / 60)}m` });
  };

  const handleAddScene = () => {
    setShowAddModal(true);
  };

  const handleDeleteScene = (sceneId: string) => {
    if (!confirm('Delete this scene?')) return;
    deleteSceneMutation.mutate(sceneId, {
      onSuccess: () => {
        if (activeSceneId === sceneId) {
          const remaining = scenes.filter(s => s.id !== sceneId);
          setActiveScene(remaining[0]?.id || null as unknown as string);
        }
      },
    });
  };

  const handleSaveStoryData = (field: string, value: unknown) => {
    if (!activeSceneId) return;
    saveScene.mutate({ sceneId: activeSceneId, data: { [field]: value } });
  };

  // Debounced save for scene value slider
  const debouncedSaveValue = useDebouncedCallback((v: number) => {
    if (!activeSceneId) return;
    saveScene.mutate({ sceneId: activeSceneId, data: { storyValueScore: v } });
  }, 800);

  // Debounced save for arc scores
  const debouncedSaveArc = useDebouncedCallback((charId: string, ext: number, int_: number) => {
    if (!activeSceneId) return;
    saveScene.mutate({
      sceneId: activeSceneId,
      data: { characterArcs: [{ characterId: charId, externalScore: ext, internalScore: int_ }] },
    });
  }, 600);

  // Toggle character in scene
  const handleToggleCharacter = useCallback((charId: string) => {
    if (!activeSceneId || !activeSceneListItem) return;
    const current = activeSceneListItem.sceneCharacters?.map(sc => sc.character.id) || [];
    const isIn = current.includes(charId);
    const newIds = isIn ? current.filter(c => c !== charId) : [...current, charId];
    saveScene.mutate({ sceneId: activeSceneId, data: { characterIds: newIds } });
  }, [activeSceneId, activeSceneListItem, saveScene]);

  const sceneCharIds = new Set(activeSceneListItem?.sceneCharacters?.map(sc => sc.character.id) || []);
  const majorCharsInScene = characters.filter(c => c.isMajor && sceneCharIds.has(c.id));

  // Scene value color
  const valueColor = sceneValue <= 30 ? '#C0392B' : sceneValue <= 69 ? '#E67E22' : '#1D9E75';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Editor top bar */}
      <div className="h-12 bg-surface-card border-b border-border px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-txt-muted hover:text-txt-primary">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-[15px] font-medium text-txt-primary truncate max-w-[200px]">
            {screenplay?.title || tc('loading')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { href: `/screenplay/${id}/edit`, label: t('toolbar.action'), icon: BookOpen },
            { href: `/screenplay/${id}/characters`, label: 'Characters', icon: Users },
            { href: `/screenplay/${id}/locations`, label: 'Locations', icon: MapPin },
            { href: `/screenplay/${id}/cards`, label: 'Cards', icon: BookOpen },
            { href: `/screenplay/${id}/titlepage`, label: 'Title Page', icon: BookOpen },
            { href: `/screenplay/${id}/analytics`, label: 'Analytics', icon: BarChart3 },
            { href: `/screenplay/${id}/structure`, label: 'Structure', icon: Film },
            { href: `/screenplay/${id}/kronotop`, label: 'Xronotop', icon: MapPin },
            { href: `/screenplay/${id}/share`, label: 'Share', icon: Share2 },
            { href: `/screenplay/${id}/export`, label: 'Export', icon: Download },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="px-2.5 py-1.5 text-xs font-medium text-txt-secondary hover:text-txt-primary hover:bg-surface-hover rounded transition-colors flex items-center gap-1.5">
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-txt-muted">{formatSavedTime()}</span>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT PANEL ─── */}
        <div className={cn(
          'bg-surface-panel overflow-y-auto transition-all duration-250 shrink-0',
          leftPanelOpen ? 'w-[250px]' : 'w-12'
        )}>
          <div className="p-3 flex items-center justify-between">
            <button onClick={toggleLeftPanel} className="text-txt-muted hover:text-txt-primary">
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
          {leftPanelOpen && (
            <div className="px-3 pb-4">
              {/* Add Scene */}
              <div className="mb-3">
                <button
                  onClick={handleAddScene}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('leftPanel.addScene')}
                </button>
              </div>

              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-txt-muted mb-2">{t('leftPanel.structure')}</h3>

              {scenes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 p-4">
                  <Film className="w-8 h-8 text-txt-muted" />
                  <p className="text-sm text-txt-secondary text-center">
                    {t('leftPanel.noScenes') || 'No scenes yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {scenes.map((scene) => (
                    <div key={scene.id} className="group flex items-center">
                      <button
                        onClick={() => setActiveScene(scene.id)}
                        className={cn(
                          'flex-1 text-left px-2.5 py-2 rounded-l text-sm transition-all',
                          activeSceneId === scene.id
                            ? 'bg-primary text-white'
                            : 'text-txt-primary hover:bg-surface-hover'
                        )}
                      >
                        <span className="font-mono text-xs mr-2">{scene.sceneNumber}</span>
                        <span className="text-xs">{scene.intExt}. {scene.location?.name || 'Untitled'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-txt-muted hover:text-[var(--color-danger)] transition-all"
                        title="Delete scene"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── CHARACTER CHIPS ─── */}
              {activeSceneId && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-txt-muted mb-2">
                    {t('leftPanel.inThisScene')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {characters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => handleToggleCharacter(char.id)}
                        className={cn(
                          'px-2.5 py-1 text-xs rounded-full border transition-colors',
                          sceneCharIds.has(char.id)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-transparent text-txt-secondary border-border hover:border-primary hover:text-primary'
                        )}
                      >
                        {char.name}
                      </button>
                    ))}
                    {characters.length === 0 && (
                      <p className="text-xs text-txt-muted">No characters yet</p>
                    )}
                  </div>
                </div>
              )}

              {/* ─── SCENE VALUE SLIDER ─── */}
              {activeSceneId && (
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-txt-muted">
                      {t('leftPanel.sceneValue')}
                    </p>
                    <span className="text-lg font-mono font-bold" style={{ color: valueColor }}>
                      {sceneValue}
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={1}
                    value={sceneValue}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSceneValue(v);
                      debouncedSaveValue(v);
                    }}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${valueColor} ${sceneValue}%, var(--border-color) ${sceneValue}%)`,
                    }}
                  />
                  <p className="text-[10px] text-txt-muted mt-1">{t('leftPanel.dramaticCharge')}</p>
                </div>
              )}

              {/* ─── KRONOTOP BADGES ─── */}
              <SceneKronotopBadges sceneId={activeSceneId} screenplayId={id} />
            </div>
          )}
        </div>

        {/* ─── CENTER PANEL (Tiptap Editor) ─── */}
        <div className="flex-1 bg-surface-base overflow-y-auto">
          {activeSceneId && activeScene ? (
            <ScreenplayEditor
              key={activeSceneId}
              sceneId={activeSceneId}
              screenplayId={id}
              initialContent={activeScene.content}
              scenes={scenes}
              onSceneNavigate={setActiveScene}
            />
          ) : (
            <div className="p-8">
              <div className="max-w-[680px] mx-auto bg-[var(--screenplay-page-bg)] shadow-1 rounded min-h-[800px] p-16 flex items-center justify-center">
                <p className="text-txt-muted text-center">
                  {scenes.length === 0
                    ? 'Click "+ Add Scene" to start writing.'
                    : 'Select a scene from the left panel to start editing.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className={cn(
          'bg-surface-panel overflow-y-auto transition-all duration-250 shrink-0',
          rightPanelOpen ? 'w-[260px]' : 'w-12'
        )}>
          <div className="p-3 flex items-center justify-end flex-shrink-0">
            <button onClick={toggleRightPanel} className="text-txt-muted hover:text-txt-primary">
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
          {rightPanelOpen && (
            <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-4">
              <div className="flex gap-1 mb-4">
                {(['story', 'notes', 'mentor'] as const).map((tab) => (
                  <button
                    key={tab}
                    tabIndex={-1}
                    onClick={() => setRightPanelTab(tab)}
                    className={cn(
                      'px-3 py-1.5 rounded text-xs font-medium transition-all',
                      rightPanelTab === tab ? 'bg-primary text-white' : 'text-txt-secondary hover:text-txt-primary'
                    )}
                  >
                    {tab === 'story' ? t('rightPanel.storyData') : tab === 'notes' ? t('rightPanel.notes') : t('rightPanel.mentor')}
                  </button>
                ))}
              </div>

              {/* ─── STORY DATA TAB ─── */}
              {rightPanelTab === 'story' && activeSceneId && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">{t('rightPanel.storyEvent')}</label>
                    <textarea
                      rows={2}
                      value={storyEvent}
                      onChange={(e) => setStoryEvent(e.target.value)}
                      onBlur={() => handleSaveStoryData('storyEvent', storyEvent)}
                      placeholder="What happens in one sentence..."
                      className="w-full px-2.5 py-2 border border-border rounded bg-surface-card text-sm text-txt-primary resize-none outline-none focus:border-primary"
                    />
                  </div>
                  {/* Emotion Selector */}
                  <SceneEmotionSelector
                    emotionStart={emotionStart}
                    emotionEnd={emotionEnd}
                    onUpdate={(data) => {
                      if (data.emotionStart !== undefined) { setEmotionStart(data.emotionStart); handleSaveStoryData('emotionStart', data.emotionStart); }
                      if (data.emotionEnd !== undefined) { setEmotionEnd(data.emotionEnd); handleSaveStoryData('emotionEnd', data.emotionEnd); }
                    }}
                  />

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">{t('rightPanel.valueShift')}</label>
                    <input
                      value={valueShift}
                      onChange={(e) => setValueShift(e.target.value)}
                      onBlur={() => handleSaveStoryData('valueShift', valueShift)}
                      placeholder="Hope → Despair"
                      className="w-full px-2.5 py-2 border border-border rounded bg-surface-card text-sm text-txt-primary outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">{t('rightPanel.polarityShift')}</label>
                    <div className="flex gap-1">
                      {POLARITY_OPTIONS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => { setPolarityShift(p.value); handleSaveStoryData('polarityShift', p.value); }}
                          className={cn(
                            'flex-1 py-1.5 rounded border text-xs transition-colors',
                            polarityShift === p.value
                              ? 'border-primary bg-primary text-white'
                              : 'border-border text-txt-secondary hover:bg-surface-hover'
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">{t('rightPanel.turnOn')}</label>
                    <div className="flex gap-2">
                      {['ACTION', 'REVELATION'].map((option) => (
                        <button
                          key={option}
                          onClick={() => { setTurnOn(option); handleSaveStoryData('turnOn', option); }}
                          className={cn(
                            'flex-1 py-1.5 rounded border text-xs font-medium transition-colors',
                            turnOn === option
                              ? 'border-primary bg-primary text-white'
                              : 'border-border text-txt-secondary hover:bg-surface-hover'
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border overflow-hidden">
                    <div className="flex-1 min-w-0 mr-2 overflow-hidden">
                      <label className="text-[11px] font-medium uppercase tracking-wide text-txt-muted truncate block">{t('rightPanel.turningPoint')}</label>
                    </div>
                    <button
                      onClick={() => { setTurningPoint(!turningPoint); handleSaveStoryData('turningPoint', !turningPoint); }}
                      className={cn(
                        'w-10 h-5 flex-shrink-0 rounded-full transition-colors relative',
                        turningPoint ? 'bg-primary' : 'bg-border'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        turningPoint ? 'translate-x-5' : 'translate-x-0.5'
                      )} />
                    </button>
                  </div>

                  {/* ─── CHARACTER ARC SLIDERS ─── */}
                  {majorCharsInScene.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-txt-muted mb-3">
                        {t('rightPanel.characterArcs')}
                      </p>
                      <div className="space-y-4">
                        {majorCharsInScene.map((char) => {
                          const scores = arcScores[char.id] || { ext: 50, int: 50 };
                          return (
                            <div key={char.id}>
                              <p className="text-xs font-medium text-txt-primary mb-2">{char.name}</p>
                              {/* External */}
                              <div className="mb-2">
                                <div className="flex justify-between text-[10px] text-txt-muted mb-1">
                                  <span>{t('rightPanel.externalScore')}</span>
                                  <span className="font-mono font-bold text-[var(--color-accent)]">{scores.ext}</span>
                                </div>
                                <input
                                  type="range" min={0} max={100} step={1} value={scores.ext}
                                  onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setArcScores(prev => ({ ...prev, [char.id]: { ...scores, ext: v } }));
                                    debouncedSaveArc(char.id, v, scores.int);
                                  }}
                                  className="w-full h-1 rounded-full appearance-none cursor-pointer accent-[var(--color-accent)]"
                                />
                              </div>
                              {/* Internal */}
                              <div>
                                <div className="flex justify-between text-[10px] text-txt-muted mb-1">
                                  <span>{t('rightPanel.internalScore')}</span>
                                  <span className="font-mono font-bold text-primary">{scores.int}</span>
                                </div>
                                <input
                                  type="range" min={0} max={100} step={1} value={scores.int}
                                  onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setArcScores(prev => ({ ...prev, [char.id]: { ...scores, int: v } }));
                                    debouncedSaveArc(char.id, scores.ext, v);
                                  }}
                                  className="w-full h-1 rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {rightPanelTab === 'story' && !activeSceneId && (
                <p className="text-sm text-txt-muted text-center py-8">Select a scene to edit story data.</p>
              )}

              {/* ─── NOTES TAB ─── */}
              {rightPanelTab === 'notes' && (
                <div>
                  <textarea
                    rows={6}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => activeSceneId && handleSaveStoryData('synopsis', notes)}
                    placeholder={t('rightPanel.notes') + '...'}
                    className="w-full px-2.5 py-2 border border-border rounded bg-surface-card text-sm text-txt-primary resize-y outline-none focus:border-primary"
                  />
                </div>
              )}

              {/* ─── MENTOR TAB ─── */}
              {rightPanelTab === 'mentor' && (
                <div>
                  {mentorNotes.length === 0 ? (
                    <p className="text-center py-8 text-sm text-txt-muted">
                      {t('rightPanel.mentor')} — No feedback yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {mentorNotes.map((note) => (
                        <div key={note.id} className="p-3 rounded border border-border bg-surface-card">
                          <div className="flex items-center gap-2 mb-1.5">
                            {note.type === 'FLAG' && <Flag className="w-3.5 h-3.5 text-[var(--color-warning)]" />}
                            {note.type === 'MESSAGE' && <MessageSquare className="w-3.5 h-3.5 text-primary" />}
                            <span className="text-xs font-medium text-txt-primary">{note.mentor.name}</span>
                            {note.flagReason && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                                {note.flagReason}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-txt-secondary">{note.content}</p>
                          <span className="text-[10px] text-txt-muted mt-1 block">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="h-8 bg-surface-card border-t border-border px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[11px] font-mono text-txt-muted">
          <span>{scenes.length} scenes</span>
        </div>
        <span className="text-[11px] font-mono text-txt-muted truncate max-w-[200px]">{screenplay?.title}</span>
        <span className="text-[11px] font-mono text-txt-muted">{formatSavedTime()}</span>
      </div>

      {/* Add Scene Modal */}
      {showAddModal && (
        <AddSceneModal screenplayId={id} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
