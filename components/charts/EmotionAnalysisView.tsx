'use client';

import * as d3 from 'd3';
import { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EMOTIONS } from '@/lib/emotions';

interface EmotionAnalysisData {
  totalScenes: number;
  scenesWithEmotions: number;
  transitionCounts: Record<string, number>;
  startDistribution: Record<string, number>;
  endDistribution: Record<string, number>;
  diversityScore: number;
  repeatedTransitions: [string, number][];
}

interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'warning' | 'success';
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-[var(--surface-panel)] rounded-xl p-4 border border-[var(--border-color)]">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${
        color === 'warning' ? 'text-[var(--color-warning)]' :
        color === 'success' ? 'text-[var(--color-accent)]' :
        'text-[var(--text-primary)]'
      }`}>{value}</p>
    </div>
  );
}

interface DistProps {
  startDist: Record<string, number>;
  endDist: Record<string, number>;
}

function EmotionDistributionChart({ startDist, endDist }: DistProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const allEmotions = EMOTIONS.filter(
      (e) => (startDist[e.id] ?? 0) > 0 || (endDist[e.id] ?? 0) > 0
    );

    if (allEmotions.length === 0) return;

    const margin = { top: 10, right: 20, bottom: 80, left: 40 };
    const w = (svgRef.current.clientWidth || 600) - margin.left - margin.right;
    const h = 200 - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand().domain(allEmotions.map((e) => e.id)).range([0, w]).padding(0.2);
    const x1 = d3.scaleBand().domain(['start', 'end']).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear()
      .domain([0, d3.max(allEmotions, (e) => Math.max(startDist[e.id] ?? 0, endDist[e.id] ?? 0)) ?? 1])
      .range([h, 0]);

    const groups = g.selectAll('.group').data(allEmotions).join('g')
      .attr('transform', (e) => `translate(${x0(e.id)},0)`);

    // Start bars (solid)
    groups.append('rect')
      .attr('x', () => x1('start') ?? 0)
      .attr('y', (e) => y(startDist[e.id] ?? 0))
      .attr('width', x1.bandwidth())
      .attr('height', (e) => h - y(startDist[e.id] ?? 0))
      .attr('fill', (e) => e.color)
      .attr('rx', 2);

    // End bars (lighter / striped)
    groups.append('rect')
      .attr('x', () => x1('end') ?? 0)
      .attr('y', (e) => y(endDist[e.id] ?? 0))
      .attr('width', x1.bandwidth())
      .attr('height', (e) => h - y(endDist[e.id] ?? 0))
      .attr('fill', (e) => `${e.color}60`)
      .attr('stroke', (e) => e.color)
      .attr('stroke-width', 1)
      .attr('rx', 2);

    // X axis labels (emotion names, rotated)
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x0).tickFormat((id) => {
        const emo = EMOTIONS.find((e) => e.id === id);
        return emo?.az ?? id;
      }))
      .call((ag) => ag.select('.domain').remove())
      .call((ag) => ag.selectAll('.tick text')
        .attr('font-size', 9)
        .attr('fill', 'var(--text-muted)')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')
        .attr('dy', '0.5em'));

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4))
      .call((ag) => ag.select('.domain').remove())
      .call((ag) => ag.selectAll('.tick text').attr('font-size', 9).attr('fill', 'var(--text-muted)'));

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${margin.left},${h + margin.top + 70})`);
    legend.append('rect').attr('width', 10).attr('height', 10).attr('fill', '#2D2B6B').attr('rx', 2);
    legend.append('text').attr('x', 14).attr('y', 9).attr('font-size', 10).attr('fill', 'var(--text-secondary)').text('Başlanğıc duyğu');
    legend.append('rect').attr('x', 130).attr('width', 10).attr('height', 10).attr('fill', '#2D2B6B40').attr('stroke', '#2D2B6B').attr('rx', 2);
    legend.append('text').attr('x', 144).attr('y', 9).attr('font-size', 10).attr('fill', 'var(--text-secondary)').text('Son duyğu');
  }, [startDist, endDist]);

  return <svg ref={svgRef} className="w-full" height={230} />;
}

export function EmotionAnalysisView({ screenplayId }: { screenplayId: string }) {
  const { data, isLoading } = useQuery<EmotionAnalysisData>({
    queryKey: ['emotion-analysis', screenplayId],
    queryFn: () =>
      fetch(`/api/screenplays/${screenplayId}/emotion-analysis`).then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--border-color)] border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.scenesWithEmotions === 0) {
    return (
      <div className="p-6 text-center text-sm text-[var(--text-muted)] italic">
        Hələ heç bir sahnəyə emosional dönüşüm əlavə edilməyib.
        Sol paneldən hər sahnə üçün başlanğıc və son duyğunu seçin.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Analiz edilən səhnə" value={data.scenesWithEmotions} />
        <StatCard label="Unikal dönüşüm cütü" value={Object.keys(data.transitionCounts).length} />
        <StatCard
          label="Müxtəliflik göstəricisi"
          value={`${data.diversityScore}/100`}
          color={data.diversityScore < 30 ? 'warning' : 'success'}
        />
      </div>

      {/* Repeated transition warning */}
      {data.repeatedTransitions.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <p className="text-sm font-medium text-orange-700 mb-2">⚠️ Təkrarlanan dönüşümlər</p>
          <div className="space-y-1">
            {data.repeatedTransitions.map(([transition, count]) => {
              const [start, end] = transition.split('→');
              const startEmo = EMOTIONS.find((e) => e.id === start);
              const endEmo = EMOTIONS.find((e) => e.id === end);
              return (
                <div key={transition} className="flex items-center gap-2 text-sm flex-wrap">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ background: `${startEmo?.color}20`, color: startEmo?.color }}
                  >
                    {startEmo?.az ?? start}
                  </span>
                  <span className="text-orange-400">→</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ background: `${endEmo?.color}20`, color: endEmo?.color }}
                  >
                    {endEmo?.az ?? end}
                  </span>
                  <span className="text-orange-600 font-mono font-bold">{count}×</span>
                  <span className="text-orange-500 text-xs">— ritim təkrara düşmüş ola bilər</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Distribution chart */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
          Başlanğıc vs Son Duyğu Paylanması
        </p>
        <EmotionDistributionChart
          startDist={data.startDistribution}
          endDist={data.endDistribution}
        />
      </div>
    </div>
  );
}
