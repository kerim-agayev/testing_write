'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCharacters, useCreateCharacter, useUpdateCharacter } from '@/lib/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Toggle } from '@/components/ui/Toggle';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils/cn';
import type { CharacterRole } from '@/types/api';

const ROLE_LABELS: Record<CharacterRole, string> = {
  PROTAGONIST: 'Protagonist', ANTAGONIST: 'Antagonist', SUPPORTING: 'Supporting', MINOR: 'Minor',
};

export default function CharactersPage() {
  const { id } = useParams<{ id: string }>();
  const { data: characters = [], isLoading } = useCharacters(id);
  const createMutation = useCreateCharacter(id);
  const updateMutation = useUpdateCharacter(id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [detailTab, setDetailTab] = useState('profile');

  const chars = characters as Array<{
    id: string; name: string; roleType: CharacterRole; isMajor: boolean;
    age: number | null; traits: string[]; _count: { sceneCharacters: number };
  }>;

  const filtered = filter === 'all' ? chars : chars.filter((c) => c.roleType === filter);
  const selected = chars.find((c) => c.id === selectedId);

  const handleAddCharacter = async () => {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName, roleType: 'SUPPORTING', isMajor: false });
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left sidebar - Character list */}
      <div className="w-[300px] bg-surface-panel border-r border-border overflow-y-auto shrink-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/screenplay/${id}/edit`} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-txt-primary">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>

          <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted mb-3">Characters</h2>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1 mb-4">
            {['all', 'PROTAGONIST', 'ANTAGONIST', 'SUPPORTING', 'MINOR'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'text-xs px-2 py-1 rounded transition-colors',
                  filter === f ? 'bg-primary text-white' : 'text-txt-muted hover:text-txt-primary'
                )}
              >
                {f === 'all' ? 'All' : ROLE_LABELS[f as CharacterRole]}
              </button>
            ))}
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="mb-3 flex gap-2">
              <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={handleAddCharacter} loading={createMutation.isPending}>Add</Button>
            </div>
          )}

          {/* Character list */}
          {isLoading ? (
            <p className="text-sm text-txt-muted">Loading...</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all',
                    selectedId === c.id ? 'bg-[#F8F7FF] border-l-[3px] border-primary' : 'hover:bg-surface-hover'
                  )}
                >
                  <Avatar name={c.name} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-txt-primary truncate">{c.name}</p>
                    <div className="flex items-center gap-2">
                      {c.age && <span className="text-xs text-txt-muted">{c.age}</span>}
                      <Badge variant={c.roleType.toLowerCase() as 'protagonist' | 'antagonist' | 'supporting' | 'minor'}>
                        {ROLE_LABELS[c.roleType]}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content - Character detail */}
      <div className="flex-1 overflow-y-auto p-8">
        {selected ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-semibold text-txt-primary">{selected.name}</h1>
              <Badge variant={selected.roleType.toLowerCase() as 'protagonist' | 'antagonist' | 'supporting' | 'minor'}>
                {ROLE_LABELS[selected.roleType]}
              </Badge>
            </div>

            <div className="flex items-center gap-6 text-sm text-txt-secondary mb-6">
              {selected.age && <span>Age {selected.age}</span>}
              <span>In {selected._count.sceneCharacters} scenes</span>
              <Toggle
                checked={selected.isMajor}
                onChange={(v) => updateMutation.mutate({ id: selected.id, data: { isMajor: v } })}
                label="Track arc?"
              />
            </div>

            <Tabs
              tabs={[
                { key: 'profile', label: 'Profile' },
                { key: 'arc', label: 'Arc Chart' },
              ]}
              activeTab={detailTab}
              onTabChange={setDetailTab}
            />

            <div className="mt-6">
              {detailTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-txt-secondary mb-2">Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.traits.map((t, i) => (
                        <Badge key={i} variant="genre">{t}</Badge>
                      ))}
                      <Badge variant="genre" onClick={() => {}}>+ Add trait</Badge>
                    </div>
                  </div>
                </div>
              )}
              {detailTab === 'arc' && (
                <div className="py-10 text-center text-txt-muted">
                  {selected.isMajor
                    ? 'Add internal/external scores in the editor to see the arc chart.'
                    : `Arc tracking is enabled for major characters. Change ${selected.name} to a major character to track their journey.`}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-txt-muted">
            Select a character to view details
          </div>
        )}
      </div>
    </div>
  );
}
