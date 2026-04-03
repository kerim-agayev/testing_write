'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useScreenplay, useScenes } from '@/lib/api/hooks';
import { useEditorStore } from '@/store/editorStore';
import Link from 'next/link';
import { PanelLeft, PanelRight, ChevronLeft, Share2, Download, Users, BarChart3, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ScreenplayFull } from '@/types/api';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: screenplayData } = useScreenplay(id);
  const screenplay = screenplayData as ScreenplayFull | undefined;
  const { data: scenesData } = useScenes(id);
  const scenes = (scenesData || []) as Array<{ id: string; sceneNumber: number; intExt: string; synopsis: string | null; timeOfDay: string | null }>;

  const {
    activeSceneId, setActiveScene, setScreenplayId,
    leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel,
    rightPanelTab, setRightPanelTab, isSaving, lastSavedAt,
  } = useEditorStore();

  useEffect(() => { setScreenplayId(id); }, [id, setScreenplayId]);

  const formatSavedTime = () => {
    if (isSaving) return 'Saving...';
    if (!lastSavedAt) return '';
    const s = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    if (s < 5) return 'Saved just now';
    if (s < 60) return `Saved ${s}s ago`;
    return `Saved ${Math.floor(s / 60)}m ago`;
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
            {screenplay?.title || 'Loading...'}
          </span>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-1">
          {[
            { href: `/screenplay/${id}/edit`, label: 'Editor', icon: BookOpen },
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
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-txt-muted mb-2">Structure</h3>
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
            </div>
          )}
        </div>

        {/* Center Panel */}
        <div className="flex-1 bg-surface-base overflow-y-auto p-8">
          <div className="max-w-[680px] mx-auto bg-surface-card shadow-1 rounded min-h-[800px] p-16">
            <div className="font-screenplay text-[12pt] leading-normal text-txt-primary">
              {activeSceneId ? (
                <div>
                  <p className="uppercase font-bold mb-4">
                    {scenes.find(s => s.id === activeSceneId)?.intExt}.{' '}
                    {scenes.find(s => s.id === activeSceneId)?.synopsis || 'LOCATION'} -{' '}
                    {scenes.find(s => s.id === activeSceneId)?.timeOfDay || 'DAY'}
                  </p>
                  <p className="text-txt-muted italic">
                    Select a scene from the left panel. Rich text editor (Tiptap) will be integrated here.
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
                    {tab === 'story' ? 'Story Data' : tab === 'notes' ? 'Notes' : 'Mentor'}
                  </button>
                ))}
              </div>

              {rightPanelTab === 'story' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">Story Event</label>
                    <textarea rows={2} placeholder="What happens in one sentence..." className="w-full px-2.5 py-2 border border-border rounded bg-surface-card text-sm text-txt-primary resize-none outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">Value Shift</label>
                    <input placeholder="Hope → Despair" className="w-full px-2.5 py-2 border border-border rounded bg-surface-card text-sm text-txt-primary outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">Polarity Shift</label>
                    <div className="flex gap-1">
                      {['+→+', '+→-', '-→+', '-→-', '●'].map((p) => (
                        <button key={p} className="flex-1 py-1.5 rounded border border-border text-xs text-txt-secondary hover:bg-surface-hover">
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === 'notes' && (
                <div>
                  <textarea rows={4} placeholder="Personal scene notes..." className="w-full px-2.5 py-2 border border-border rounded bg-surface-card text-sm text-txt-primary resize-y outline-none focus:border-primary" />
                </div>
              )}

              {rightPanelTab === 'mentor' && (
                <div className="text-center py-8 text-sm text-txt-muted">
                  No mentor feedback for this scene yet.
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
