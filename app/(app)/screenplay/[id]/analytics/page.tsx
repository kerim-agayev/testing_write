'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAnalytics } from '@/lib/api/hooks';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AnalyticsData } from '@/types/api';

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useAnalytics(id);
  const analytics = data as AnalyticsData | undefined;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
        <p className="text-txt-muted">Loading analytics...</p>
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

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/screenplay/${id}/edit`} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-txt-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </Link>
      </div>

      {/* Story Arc Chart */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-txt-primary">Story Arc</h2>
          <Button variant="ghost" size="sm"><Download className="w-4 h-4" /> Download PNG</Button>
        </div>
        <div className="bg-surface-card border border-border rounded-lg p-6" style={{ height: 500 }}>
          {analytics.storyArc.length > 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="font-mono text-sm text-txt-muted mb-2">Story Arc Visualization</p>
                <p className="text-txt-secondary text-sm">
                  {analytics.storyArc.length} data points across scenes
                </p>
                {/* D3 chart will be rendered here */}
                <div className="mt-4 flex items-end justify-center gap-1 h-40">
                  {analytics.storyArc.map((point) => (
                    <div
                      key={point.sceneId}
                      className="w-6 bg-accent rounded-t cursor-pointer hover:bg-accent-dark transition-colors"
                      style={{ height: `${point.storyValueScore}%` }}
                      title={`Scene ${point.sceneNumber}: ${point.storyValueScore}`}
                      onClick={() => router.push(`/screenplay/${id}/edit?scene=${point.sceneId}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-txt-muted py-20">Write more scenes to generate your Story Arc.</p>
          )}
        </div>
      </section>

      {/* Character Arc Charts */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted mb-4">Character Journeys</h2>
        {analytics.characterArcs.length > 0 ? (
          <div className="space-y-6">
            {analytics.characterArcs.map(({ character, arcs }) => (
              <div key={character.id} className="bg-surface-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-txt-primary mb-4">{character.name}</h3>
                {arcs.length > 0 ? (
                  <div className="h-40 flex items-end gap-2">
                    {arcs.map((arc) => (
                      <div key={arc.sceneId} className="flex flex-col items-center gap-1">
                        <div className="flex gap-0.5">
                          <div className="w-2 bg-accent rounded-t" style={{ height: `${arc.externalScore}%` }} />
                          <div className="w-2 bg-primary rounded-t opacity-60" style={{ height: `${arc.internalScore}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-txt-muted">{arc.sceneNumber}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-txt-muted">Add scores in the editor to see {character.name}&apos;s arc.</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-txt-muted">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent inline-block" /> External</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary opacity-60 inline-block" style={{ borderTop: '1px dashed' }} /> Internal</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-txt-muted">No major characters to display.</p>
        )}
      </section>

      {/* Story Grid Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-txt-muted">Story Grid</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Export CSV</Button>
            <Button variant="ghost" size="sm">Export XLSX</Button>
          </div>
        </div>
        <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-20">Scene #</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted">Story Event</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-40">Value Shift</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-36">Polarity</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-28">Turn On</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-28">Turning Pt</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-txt-muted w-48">Characters</th>
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
