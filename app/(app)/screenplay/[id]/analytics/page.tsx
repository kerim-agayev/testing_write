'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAnalytics } from '@/lib/api/hooks';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StoryArcChart } from '@/components/charts/StoryArcChart';
import { CharacterArcChart } from '@/components/charts/CharacterArcChart';
import { EmotionalEKGChart } from '@/components/charts/EmotionalEKGChart';
import { ArcComparisonChart } from '@/components/charts/ArcComparisonChart';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslations } from 'next-intl';

type StoryArcPoint = { sceneId: string; sceneNumber: number; score: number | null; storyEvent: string | null; turningPoint: boolean; location: string | null };
type CharacterArcData = { character: { id: string; name: string }; arcs: Array<{ sceneId: string; sceneNumber: number; externalScore: number | null; internalScore: number | null }> };
type StoryGridRow = { sceneId: string; sceneNumber: number; storyEvent: string | null; valueShift: string | null; polarityShift: string | null; turnOn: string | null; turningPoint: boolean; onStageCharacters: Array<{ name: string }> };

type AnalyticsResp = {
  storyArc: StoryArcPoint[];
  characterArcs: CharacterArcData[];
  storyGrid: StoryGridRow[];
};

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useAnalytics(id);
  const analytics = data as AnalyticsResp | undefined;
  const t = useTranslations('analytics');

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
        <p className="text-txt-muted">No analytics data available.</p>
      </div>
    );
  }

  const handleExport = (format: 'csv' | 'xlsx') => {
    window.open(`/api/screenplays/${id}/export-grid?format=${format}`, '_blank');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/screenplay/${id}/edit`} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-txt-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </Link>
      </div>

      {/* Story Arc Chart — D3 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-txt-primary">{t('storyArc')}</h2>
        </div>
        <div className="bg-surface-card border border-border rounded-lg p-6">
          {analytics.storyArc.length > 0 ? (
            <StoryArcChart data={analytics.storyArc} screenplayId={id} />
          ) : (
            <p className="text-center text-txt-muted py-20">Write more scenes to generate your Story Arc.</p>
          )}
        </div>
      </section>

      {/* Character Arc Charts — D3 */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted mb-4">{t('characterJourneys')}</h2>
        {analytics.characterArcs.length > 0 ? (
          <div className="space-y-6">
            {analytics.characterArcs.map(({ character, arcs }) => (
              <div key={character.id} className="bg-surface-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-txt-primary mb-4">{character.name}</h3>
                {arcs.length > 0 ? (
                  <CharacterArcChart data={arcs} characterName={character.name} screenplayId={id} />
                ) : (
                  <p className="text-sm text-txt-muted">Add scores in the editor to see {character.name}&apos;s arc.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-txt-muted">No major characters to display.</p>
        )}
      </section>

      {/* Arc Comparison Chart */}
      {analytics.characterArcs.length >= 2 && (
        <section className="mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted mb-4">Güc Balansı</h2>
          <ArcComparisonChart
            screenplayId={id}
            characters={analytics.characterArcs.map(({ character }) => character)}
          />
        </section>
      )}

      {/* Emotional EKG Chart */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted mb-4">Dramatik EKG</h2>
        <EmotionalEKGChart scenes={analytics.storyArc.map((p) => ({ sceneNumber: p.sceneNumber, storyValueScore: p.score, turningPoint: p.turningPoint }))} />
      </section>

      {/* Story Grid Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted">{t('storyGrid')}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleExport('csv')}>
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('xlsx')}>
              <Download className="w-3.5 h-3.5" /> XLSX
            </Button>
          </div>
        </div>
        <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-20">{t('sceneNo')}</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted">{t('storyEvent')}</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-40">{t('valueShift')}</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-36">{t('polarityShift')}</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-28">{t('turnOn')}</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-28">{t('turningPoint')}</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-48">{t('onStageCharacters')}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.storyGrid.map((row, i) => (
                  <tr
                    key={row.sceneId}
                    onClick={() => router.push(`/screenplay/${id}/edit?scene=${row.sceneId}`)}
                    className={`border-b border-border cursor-pointer hover:bg-surface-hover transition-colors ${
                      row.turningPoint ? 'bg-story-turning' : i % 2 === 0 ? '' : 'bg-surface-hover'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-sm text-txt-primary">{row.sceneNumber}</td>
                    <td className="px-4 py-3 text-sm text-txt-primary">{row.storyEvent || '—'}</td>
                    <td className="px-4 py-3 text-sm text-txt-primary">{row.valueShift || '—'}</td>
                    <td className="px-4 py-3">
                      {row.polarityShift ? (
                        <Badge variant={row.polarityShift.includes('NEG') ? 'antagonist' : 'active'}>
                          {row.polarityShift.replace(/_/g, ' → ').replace('POS', '+').replace('NEG', '-')}
                        </Badge>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{row.turnOn || '—'}</td>
                    <td className="px-4 py-3 text-sm">{row.turningPoint ? '✦' : '—'}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">
                      {row.onStageCharacters.map((c) => c.name).join(', ') || '—'}
                    </td>
                  </tr>
                ))}
                {analytics.storyGrid.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-txt-muted">No scene data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
