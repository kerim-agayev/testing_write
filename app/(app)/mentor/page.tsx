'use client';

import { useState } from 'react';
import { useMentorAssignments, useCreateMentorNote } from '@/lib/api/hooks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Flag, MessageSquare, Send } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/cn';

export default function MentorPage() {
  const { data } = useMentorAssignments();
  const assignments = (data || []) as Array<{
    id: string; screenplayId: string; status: string;
    screenplay: { id: string; title: string; type: string; owner: { id: string; name: string } };
  }>;
  const createNote = useCreateMentorNote();
  const addToast = useUIStore((s) => s.addToast);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'NOTE' | 'FLAG'>('NOTE');
  const [flagReason, setFlagReason] = useState('');

  const selected = assignments.find((a) => a.screenplayId === selectedId);

  const handleSubmitNote = async () => {
    if (!noteContent.trim() || !selectedId) return;
    try {
      await createNote.mutateAsync({
        sceneId: 'placeholder', // Will need actual scene selection
        content: noteContent,
        type: noteType,
        flagReason: noteType === 'FLAG' ? flagReason : null,
      });
      addToast('Note added successfully', 'success');
      setNoteContent('');
    } catch {
      addToast('Failed to add note', 'error');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left sidebar - Assigned scripts */}
      <div className="w-[300px] bg-surface-panel border-r border-border overflow-y-auto shrink-0">
        <div className="p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted mb-4">Assigned Scripts</h2>
          {assignments.length === 0 ? (
            <p className="text-sm text-txt-muted">No scripts assigned for review at this time.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.screenplayId)}
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

            {/* Mentor tools */}
            <div className="bg-surface-card border border-border rounded-lg p-6 max-w-lg">
              <h3 className="text-sm font-semibold text-txt-primary mb-4">Mentor Tools</h3>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setNoteType('NOTE')}
                  className={cn('flex-1 py-2 rounded text-sm font-medium transition-all', noteType === 'NOTE' ? 'bg-primary text-white' : 'bg-surface-panel text-txt-secondary')}
                >
                  <MessageSquare className="w-4 h-4 inline mr-1" /> Note
                </button>
                <button
                  onClick={() => setNoteType('FLAG')}
                  className={cn('flex-1 py-2 rounded text-sm font-medium transition-all', noteType === 'FLAG' ? 'bg-warning text-white' : 'bg-surface-panel text-txt-secondary')}
                >
                  <Flag className="w-4 h-4 inline mr-1" /> Flag
                </button>
              </div>

              {noteType === 'FLAG' && (
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full mb-3 h-10 px-3 border border-border rounded bg-surface-card text-sm text-txt-primary"
                >
                  <option value="">Select reason...</option>
                  <option value="Pacing">Pacing</option>
                  <option value="Dialogue">Dialogue</option>
                  <option value="Structure">Structure</option>
                  <option value="Character">Character</option>
                  <option value="Other">Other</option>
                </select>
              )}

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your feedback..."
                rows={4}
                className="w-full px-3 py-2.5 border border-border rounded bg-surface-card text-sm text-txt-primary resize-y outline-none focus:border-primary mb-3"
              />

              <Button onClick={handleSubmitNote} loading={createNote.isPending} className="w-full">
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
    </div>
  );
}
