'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCharacters, useCreateCharacter, useUpdateCharacter } from '@/lib/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Toggle } from '@/components/ui/Toggle';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils/cn';
import type { CharacterRole } from '@/types/api';

export default function CharactersPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('characters');
  const tc = useTranslations('common');
  const { data: characters = [], isLoading } = useCharacters(id);
  const createMutation = useCreateCharacter(id);
  const updateMutation = useUpdateCharacter(id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [detailTab, setDetailTab] = useState('profile');
  const [addingTrait, setAddingTrait] = useState(false);
  const [newTrait, setNewTrait] = useState('');

  const ROLE_LABELS: Record<CharacterRole, string> = {
    PROTAGONIST: t('protagonist'), ANTAGONIST: t('antagonist'), SUPPORTING: t('supporting'), MINOR: t('minor'),
  };

  const chars = characters as Array<{
    id: string; name: string; roleType: CharacterRole; isMajor: boolean;
    age: number | null; height: string | null; weight: string | null;
    personality: string | null; biography: string | null;
    traits: string[]; _count: { sceneCharacters: number };
  }>;

  const filtered = filter === 'all' ? chars : chars.filter((c) => c.roleType === filter);
  const selected = chars.find((c) => c.id === selectedId);

  const handleAddCharacter = async () => {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName, roleType: 'SUPPORTING', isMajor: false });
    setNewName('');
    setShowAddForm(false);
  };

  const handleAddTrait = () => {
    if (!newTrait.trim() || !selected) return;
    const updatedTraits = [...selected.traits, newTrait.trim()];
    updateMutation.mutate({ id: selected.id, data: { traits: updatedTraits } });
    setNewTrait('');
    setAddingTrait(false);
  };

  const handleRemoveTrait = (traitToRemove: string) => {
    if (!selected) return;
    const updatedTraits = selected.traits.filter((tr) => tr !== traitToRemove);
    updateMutation.mutate({ id: selected.id, data: { traits: updatedTraits } });
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left sidebar - Character list */}
      <div className="w-[300px] bg-surface-panel border-r border-border overflow-y-auto shrink-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/screenplay/${id}/edit`} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-txt-primary">
              <ArrowLeft className="w-4 h-4" /> {tc('back')}
            </Link>
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="w-3.5 h-3.5" /> {tc('create')}
            </Button>
          </div>

          <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted mb-3">{t('addCharacter').replace('əlavə et', '').trim() || 'Characters'}</h2>

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
                {f === 'all' ? tc('confirm').replace('Təsdiq et', 'All') || 'All' : ROLE_LABELS[f as CharacterRole]}
              </button>
            ))}
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="mb-3 flex gap-2">
              <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={handleAddCharacter} loading={createMutation.isPending}>{tc('create')}</Button>
            </div>
          )}

          {/* Character list */}
          {isLoading ? (
            <p className="text-sm text-txt-muted">{tc('loading')}</p>
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
              <span>{selected._count.sceneCharacters} scenes</span>
              <Toggle
                checked={selected.isMajor}
                onChange={(v) => updateMutation.mutate({ id: selected.id, data: { isMajor: v } })}
                label={t('isMajor')}
              />
            </div>

            <Tabs
              tabs={[
                { key: 'profile', label: 'Profile' },
                { key: 'arc', label: t('episodeArc').replace('Bölüm Arkı', 'Arc Chart') || 'Arc Chart' },
              ]}
              activeTab={detailTab}
              onTabChange={setDetailTab}
            />

            <div className="mt-6">
              {detailTab === 'profile' && (
                <div className="space-y-6 max-w-xl">
                  {/* Role selector */}
                  <div>
                    <h3 className="text-sm font-medium text-txt-secondary mb-2">Role</h3>
                    <div className="flex gap-2">
                      {(['PROTAGONIST', 'ANTAGONIST', 'SUPPORTING', 'MINOR'] as CharacterRole[]).map((role) => (
                        <button
                          key={role}
                          onClick={() => updateMutation.mutate({ id: selected.id, data: { roleType: role } })}
                          className={cn(
                            'px-3 py-1.5 text-xs rounded border transition-colors',
                            selected.roleType === role
                              ? 'bg-primary text-white border-primary'
                              : 'border-border text-txt-secondary hover:border-primary'
                          )}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age, Height, Weight */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-txt-secondary mb-1">Age</label>
                      <input
                        type="number" min={0} max={150}
                        defaultValue={selected.age ?? ''}
                        onBlur={(e) => updateMutation.mutate({ id: selected.id, data: { age: e.target.value ? Number(e.target.value) : null } })}
                        placeholder="28"
                        className="w-full px-2.5 py-2 text-sm border border-border rounded bg-surface-card text-txt-primary outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-txt-secondary mb-1">Height</label>
                      <input
                        type="text"
                        defaultValue={selected.height ?? ''}
                        onBlur={(e) => updateMutation.mutate({ id: selected.id, data: { height: e.target.value || null } })}
                        placeholder="5'10&quot;"
                        className="w-full px-2.5 py-2 text-sm border border-border rounded bg-surface-card text-txt-primary outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-txt-secondary mb-1">Weight</label>
                      <input
                        type="text"
                        defaultValue={selected.weight ?? ''}
                        onBlur={(e) => updateMutation.mutate({ id: selected.id, data: { weight: e.target.value || null } })}
                        placeholder="165 lbs"
                        className="w-full px-2.5 py-2 text-sm border border-border rounded bg-surface-card text-txt-primary outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Traits */}
                  <div>
                    <h3 className="text-sm font-medium text-txt-secondary mb-2">{t('traits')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.traits.map((trait, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--surface-hover)] text-txt-primary border border-border"
                        >
                          {trait}
                          <button
                            onClick={() => handleRemoveTrait(trait)}
                            className="ml-0.5 text-txt-muted hover:text-[var(--color-danger)] transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {addingTrait ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={newTrait}
                            onChange={(e) => setNewTrait(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTrait()}
                            onBlur={() => { if (!newTrait) setAddingTrait(false); }}
                            placeholder="Trait..."
                            className="w-24 text-sm border-b border-primary outline-none bg-transparent px-1 py-0.5"
                          />
                          <button onClick={handleAddTrait} className="text-xs text-primary font-medium">+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTrait(true)}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-border text-txt-secondary hover:text-primary hover:border-primary transition-colors"
                        >
                          + Add trait
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Personality */}
                  <div>
                    <label className="block text-sm font-medium text-txt-secondary mb-1">Personality</label>
                    <textarea
                      rows={3}
                      defaultValue={selected.personality ?? ''}
                      onBlur={(e) => updateMutation.mutate({ id: selected.id, data: { personality: e.target.value || null } })}
                      placeholder="Describe the character's personality..."
                      className="w-full px-2.5 py-2 text-sm border border-border rounded bg-surface-card text-txt-primary outline-none focus:border-primary resize-y"
                    />
                  </div>

                  {/* Biography */}
                  <div>
                    <label className="block text-sm font-medium text-txt-secondary mb-1">{t('biography')}</label>
                    <textarea
                      rows={6}
                      defaultValue={selected.biography ?? ''}
                      onBlur={(e) => updateMutation.mutate({ id: selected.id, data: { biography: e.target.value || null } })}
                      placeholder="Character backstory, motivations, key events..."
                      className="w-full px-2.5 py-2 text-sm border border-border rounded bg-surface-card text-txt-primary outline-none focus:border-primary resize-y"
                    />
                  </div>
                </div>
              )}
              {detailTab === 'arc' && (
                <div className="py-10 text-center text-txt-muted">
                  {selected.isMajor
                    ? t('externalJourney') + ' / ' + t('internalJourney') + ' — Add scores in the editor to see the arc chart.'
                    : `Arc tracking is for major characters. Enable "${t('isMajor')}" to track ${selected.name}'s journey.`}
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
