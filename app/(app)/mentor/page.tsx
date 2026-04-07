'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMentorAssignments, useCreateMentorNote, useScreenplayScenes } from '@/lib/api/hooks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Flag, MessageSquare, Send, Eye } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/cn';
import { SceneReadModal } from '@/components/mentor/SceneReadModal';

type SceneWithContent = {
  id: string;
  sceneNumber: number;
  intExt: string;
  synopsis: string | null;
  timeOfDay: string | null;
  location: { name: string } | null;
  content: unknown;
};

export default function MentorPage() {
  const t = useTranslations('mentor');
  const tc = useTranslations('common');
  const { data } = useMentorAssignments();
  const assignments = (data || []) as Array<{
    id: string; screenplayId: string; status: string;
    screenplay: { id: string; title: string; type: string; owner: { id: string; name: string } };
  }>;
  const createNote = useCreateMentorNote();
  const addToast = useUIStore((s) => s.addToast);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'NOTE' | 'FLAG'>('NOTE');
  const [flagReason, setFlagReason] = useState('');
  const [modalScene, setModalScene] = useState<SceneWithContent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const selected = assignments.find((a) => a.screenplayId === selectedId);

  const { data: scenesData } = useScreenplayScenes(selectedId || '');
  const scenes = (scenesData || []) as SceneWithContent[];

  const handleSubmitNote = async () => {
    if (!noteContent.trim() || !selectedSceneId) {
      addToast('Select a scene and write your note', 'error');
      return;
    }
    try {
      await createNote.mutateAsync({
        sceneId: selectedSceneId,
        content: noteContent,
        type: noteType,
        flagReason: noteType === 'FLAG' ? flagReason : null,
      });
      addToast(t('noteAdded') || 'Note added', 'success');
      setNoteContent('');
      setFlagReason('');
    } catch {
      addToast('Failed to add note', 'error');
    }
  };

  const handleViewScene = (scene: SceneWithContent, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalScene(scene);
    setModalOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left sidebar - Assigned scripts */}
      <div className="w-[300px] bg-surface-panel border-r border-border overflow-y-auto shrink-0">
        <div className="p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted mb-4">
            {t('assignedScripts') || 'Assigned Scripts'}
          </h2>
          {assignments.length === 0 ? (
            <p className="text-sm text-txt-muted">{t('noAssignments') || 'No scripts assigned for review.'}</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setSelectedId(a.screenplayId); setSelectedSceneId(null); }}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    selectedId === a.screenplayId
                      ? 'border-primary bg-[#F8F7FF]'
                      : 'border-border hover:border-txt-muted'
                  )}
                >
                  <p className="font-semibold text-sm text-txt-primary">{a.screenplay.title}</p>
                  <p className="text-xs text-txt-muted mt-1">by {a.screenplay.owner.name}</p>
                  <Badge variant={a.screenplay.type === 'FILM' ? 'film' : 'series'} className="mt-2">
                    {a.screenplay.type}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">
        {selected ? (
          <div>
            <div className="mb-6">
              <p className="text-xs text-txt-muted uppercase tracking-wide mb-1">Reviewing</p>
              <h1 className="text-2xl font-semibold text-txt-primary">{selected.screenplay.title}</h1>
              <p className="text-sm text-txt-secondary">by {selected.screenplay.owner.name}</p>
            </div>

            {/* Scene selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wide text-txt-muted mb-2">
                Select Scene
              </label>
              {scenes.length === 0 ? (
                <p className="text-sm text-txt-muted">{tc('loading')}</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[240px] overflow-y-auto">
                  {scenes.map((scene) => (
                    <div
                      key={scene.id}
                      className={cn(
                        'relative group text-left p-2 rounded border text-sm transition-all cursor-pointer',
                        selectedSceneId === scene.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-txt-secondary hover:border-txt-muted'
                      )}
                      onClick={() => setSelectedSceneId(scene.id)}
                    >
                      <span className="font-mono text-xs">#{scene.sceneNumber}</span>{' '}
                      <span className="text-xs">{scene.intExt}. {scene.synopsis || 'Untitled'}</span>
                      {/* View content button */}
                      <button
                        onClick={(e) => handleViewScene(scene, e)}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-panel"
                        title="Sahnəyə bax"
                      >
                        <Eye size={11} className="text-txt-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mentor tools */}
            <div className="bg-surface-card border border-border rounded-lg p-6 max-w-lg">
              <h3 className="text-sm font-semibold text-txt-primary mb-4">{t('mentorTools') || 'Mentor Tools'}</h3>

              {!selectedSceneId && (
                <p className="text-sm text-[var(--color-warning)] mb-4">Select a scene above to add feedback.</p>
              )}

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setNoteType('NOTE')}
                  className={cn('flex-1 py-2 rounded text-sm font-medium transition-all', noteType === 'NOTE' ? 'bg-primary text-white' : 'bg-surface-panel text-txt-secondary')}
                >
                  <MessageSquare className="w-4 h-4 inline mr-1" /> {t('addNote') || 'Note'}
                </button>
                <button
                  onClick={() => setNoteType('FLAG')}
                  className={cn('flex-1 py-2 rounded text-sm font-medium transition-all', noteType === 'FLAG' ? 'bg-[var(--color-warning)] text-white' : 'bg-surface-panel text-txt-secondary')}
                >
                  <Flag className="w-4 h-4 inline mr-1" /> {t('flagScene') || 'Flag'}
                </button>
              </div>

              {noteType === 'FLAG' && (
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full mb-3 h-10 px-3 border border-border rounded bg-surface-card text-sm text-txt-primary"
                >
                  <option value="">Select reason...</option>
                  <option value="Pacing">{t('flagReasons.pacing') || 'Pacing'}</option>
                  <option value="Dialogue">{t('flagReasons.dialogue') || 'Dialogue'}</option>
                  <option value="Structure">{t('flagReasons.structure') || 'Structure'}</option>
                  <option value="Character">{t('flagReasons.character') || 'Character'}</option>
                  <option value="Other">{t('flagReasons.other') || 'Other'}</option>
                </select>
              )}

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your feedback..."
                rows={4}
                className="w-full px-3 py-2.5 border border-border rounded bg-surface-card text-sm text-txt-primary resize-y outline-none focus:border-primary mb-3"
              />

              <Button
                onClick={handleSubmitNote}
                loading={createNote.isPending}
                className="w-full"
                disabled={!selectedSceneId}
              >
                <Send className="w-4 h-4" /> Submit {noteType === 'FLAG' ? 'Flag' : 'Note'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-txt-muted">
            Select a screenplay to start reviewing
          </div>
        )}
      </div>

      {/* Scene Read Modal */}
      <SceneReadModal
        scene={modalScene}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
