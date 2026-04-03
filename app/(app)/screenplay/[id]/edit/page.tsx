'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useScreenplay, useScenes, useCreateScene, useSaveScene, useMentorNotes } from '@/lib/api/hooks';
import { useEditorStore } from '@/store/editorStore';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PanelLeft, PanelRight, ChevronLeft, Share2, Download, Users, BarChart3, BookOpen, Plus, Film, Flag, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ScreenplayFull } from '@/types/api';

const POLARITY_OPTIONS = [
  { value: 'POS_TO_POS', label: '+→+' },
  { value: 'POS_TO_NEG', label: '+→-' },
  { value: 'NEG_TO_POS', label: '-→+' },
  { value: 'NEG_TO_NEG', label: '-→-' },
  { value: 'NEUTRAL', label: '●' },
];

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('editor');
  const tc = useTranslations('common');
  const { data: screenplayData } = useScreenplay(id);
  const screenplay = screenplayData as ScreenplayFull | undefined;
  const { data: scenesData } = useScenes(id);
  const scenes = (scenesData || []) as Array<{
    id: string; sceneNumber: number; intExt: string;
    synopsis: string | null; timeOfDay: string | null;
    storyEvent?: string | null; valueShift?: string | null;
    polarityShift?: string | null; turnOn?: string | null;
    turningPoint?: boolean; storyValueScore?: number | null;
  }>;

  const createScene = useCreateScene(id);
  const saveScene = useSaveScene(id);

  const {
    activeSceneId, setActiveScene, setScreenplayId,
    leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel,
    rightPanelTab, setRightPanelTab, isSaving, lastSavedAt,
  } = useEditorStore();

  // Story data form state
  const activeScene = scenes.find(s => s.id === activeSceneId);
  const [storyEvent, setStoryEvent] = useState('');
  const [valueShift, setValueShift] = useState('');
  const [polarityShift, setPolarityShift] = useState('');
  const [turnOn, setTurnOn] = useState('');
  const [turningPoint, setTurningPoint] = useState(false);
  const [notes, setNotes] = useState('');

  // Mentor notes
  const { data: mentorNotesData } = useMentorNotes(activeSceneId || '');
  const mentorNotes = (mentorNotesData || []) as Array<{
    id: string; content: string; type: string; flagReason?: string;
    createdAt: string; mentor: { name: string };
  }>;

  // Sync form state when active scene changes
  useEffect(() => {
    if (activeScene) {
      setStoryEvent(activeScene.storyEvent || '');
      setValueShift(activeScene.valueShift || '');
      setPolarityShift(activeScene.polarityShift || '');
      setTurnOn(activeScene.turnOn || '');
      setTurningPoint(activeScene.turningPoint || false);
      setNotes(activeScene.synopsis || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSceneId]);

  useEffect(() => { setScreenplayId(id); }, [id, setScreenplayId]);

  const formatSavedTime = () => {
    if (isSaving) return t('autosave.saving');
    if (!lastSavedAt) return '';
    const s = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    if (s < 5) return t('autosave.saved', { time: '0s' });
    if (s < 60) return t('autosave.saved', { time: `${s}s` });
    return t('autosave.saved', { time: `${Math.floor(s / 60)}m` });
  };

  const handleAddScene = () => {
    createScene.mutate({});
  };

  const handleSaveStoryData = (field: string, value: unknown) => {
    if (!activeSceneId) return;
    saveScene.mutate({ sceneId: activeSceneId, data: { [field]: value } });
  };

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
            { href: `/screenplay/${id}/analytics`, label: 'Analytics', icon: BarChart3 },
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
        {/* Left Panel */}
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
              {/* Add Scene button — always visible */}
              <div className="mb-3">
                <button
                  onClick={handleAddScene}
                  disabled={createScene.isPending}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
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
                    <button
                      key={scene.id}
                      onClick={() => setActiveScene(scene.id)}
                      className={cn(
                        'w-full text-left px-2.5 py-2 rounded text-sm transition-all',
                        activeSceneId === scene.id
                          ? 'bg-primary text-white'
                          : 'text-txt-primary hover:bg-surface-hover'
                      )}
                    >
                      <span className="font-mono text-xs mr-2">{scene.sceneNumber}</span>
                      <span className="text-xs">{scene.intExt}. {scene.synopsis || 'Untitled scene'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Panel */}
        <div className="flex-1 bg-surface-base overflow-y-auto p-8">
          <div className="max-w-[680px] mx-auto bg-[var(--screenplay-page-bg)] shadow-1 rounded min-h-[800px] p-16">
            <div className="font-screenplay text-[12pt] leading-normal text-[var(--screenplay-text)]">
              {activeSceneId ? (
                <div>
                  <p className="uppercase font-bold mb-4">
                    {activeScene?.intExt}.{' '}
                    {activeScene?.synopsis || 'LOCATION'} -{' '}
                    {activeScene?.timeOfDay || 'DAY'}
                  </p>
                  <p className="text-txt-muted italic">
                    Rich text editor (Tiptap) will be integrated here.
                  </p>
                </div>
              ) : (
                <p className="text-txt-muted text-center py-20">
                  Select a scene from the left panel to start editing.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className={cn(
          'bg-surface-panel overflow-y-auto transition-all duration-250 shrink-0',
          rightPanelOpen ? 'w-[260px]' : 'w-12'
        )}>
          <div className="p-3 flex items-center justify-end">
            <button onClick={toggleRightPanel} className="text-txt-muted hover:text-txt-primary">
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
          {rightPanelOpen && (
            <div className="px-3 pb-4">
              <div className="flex gap-1 mb-4">
                {(['story', 'notes', 'mentor'] as const).map((tab) => (
                  <button
                    key={tab}
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
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-txt-muted">{t('rightPanel.turningPoint')}</label>
                    <button
                      onClick={() => { setTurningPoint(!turningPoint); handleSaveStoryData('turningPoint', !turningPoint); }}
                      className={cn(
                        'w-10 h-5 rounded-full transition-colors relative',
                        turningPoint ? 'bg-primary' : 'bg-border'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        turningPoint ? 'translate-x-5' : 'translate-x-0.5'
                      )} />
                    </button>
                  </div>
                </div>
              )}

              {rightPanelTab === 'story' && !activeSceneId && (
                <p className="text-sm text-txt-muted text-center py-8">Select a scene to edit story data.</p>
              )}

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
    </div>
  );
}
