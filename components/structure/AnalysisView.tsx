'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import * as d3 from 'd3';
import { CRITICAL_STAGES, type StructureStage } from '@/lib/structure/data';

interface AnalysisViewProps {
  structureType: string;
  stages: StructureStage[];
  assignments: any[];
  locale: 'az' | 'en' | 'ru';
}

export function AnalysisView({ structureType, stages, assignments, locale }: AnalysisViewProps) {
  const t = useTranslations('storyStructure.analysis');
  const svgRef = useRef<SVGSVGElement>(null);

  const dist = stages.map((s) => ({
    stageId: s.id,
    stageName: s.name[locale],
    count: assignments.filter((a: any) => a.structureStageId === s.id).length,
    color: s.color,
    isCritical: (CRITICAL_STAGES[structureType] ?? []).includes(s.id),
  }));

  const emptyStages = dist.filter((s) => s.count === 0);
  const criticalEmpty = emptyStages.filter((s) => s.isCritical);
  const filledCount = stages.length - emptyStages.length;

  // Insights
  const insights: { type: 'warning' | 'success' | 'info'; message: string }[] = [];
  criticalEmpty.forEach((s) => {
    insights.push({ type: 'warning', message: `"${s.stageName}" ${t('stageEmpty')}` });
  });
  const maxCount = Math.max(...dist.map((s) => s.count), 0);
  if (maxCount > 5) {
    const over = dist.find((s) => s.count === maxCount)!;
    insights.push({ type: 'info', message: `"${over.stageName}" — ${maxCount} ${t('stageFull')}` });
  }
  if (filledCount === stages.length) {
    insights.push({ type: 'success', message: t('allFilled') });
  }

  // D3 bar chart
  useEffect(() => {
    if (!svgRef.current || dist.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const margin = { top: 10, right: 20, bottom: 60, left: 40 };
    const w = (svgRef.current.clientWidth || 600) - margin.left - margin.right;
    const h = 200 - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(dist.map((s) => s.stageId)).range([0, w]).padding(0.2);
    const y = d3.scaleLinear().domain([0, Math.max(d3.max(dist, (s) => s.count) ?? 1, 3)]).range([h, 0]);

    g.selectAll('.bar')
      .data(dist)
      .join('rect')
      .attr('x', (d) => x(d.stageId) ?? 0)
      .attr('width', x.bandwidth())
      .attr('rx', 3)
      .attr('fill', (d) => (d.count === 0 ? (d.isCritical ? '#E74C3C' : 'var(--border-color)') : d.color))
      .attr('opacity', (d) => (d.count === 0 ? 0.4 : 1))
      .attr('y', h)
      .attr('height', 0)
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => h - y(d.count));

    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(
        d3.axisBottom(x).tickFormat((d) => {
          const s = dist.find((s) => s.stageId === d);
          const name = s?.stageName ?? (d as string);
          return name.length > 8 ? name.substring(0, 8) + '…' : name;
        })
      )
      .call((ag) => ag.select('.domain').remove())
      .call((ag) =>
        ag
          .selectAll('.tick text')
          .attr('font-size', 9)
          .attr('fill', 'var(--text-muted)')
          .attr('transform', 'rotate(-35)')
          .attr('text-anchor', 'end')
      );

    g.append('g')
      .call(d3.axisLeft(y).ticks(3).tickFormat((d) => `${d}`))
      .call((ag) => ag.select('.domain').remove())
      .call((ag) => ag.selectAll('.tick text').attr('font-size', 9).attr('fill', 'var(--text-muted)'));
  }, [dist]);

  return (
    <div className="p-6 overflow-y-auto flex-1 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl">
          <div className="flex items-end gap-1 mb-1">
            <span className="text-3xl font-bold font-mono">{filledCount}</span>
            <span className="text-lg text-[var(--text-muted)] mb-0.5">/ {stages.length}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{t('structureScore')}</p>
          <div className="mt-2 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
              style={{ width: `${(filledCount / stages.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="p-4 bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl">
          <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">
            {new Set(assignments.map((a: any) => a.sceneId)).size}
          </span>
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('assignedScenes')}</p>
        </div>
        <div
          className={`p-4 rounded-xl border ${
            criticalEmpty.length > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-[var(--surface-card)] border-[var(--border-color)]'
          }`}
        >
          <span
            className={`text-3xl font-bold font-mono ${
              criticalEmpty.length > 0 ? 'text-red-600' : 'text-[var(--text-primary)]'
            }`}
          >
            {criticalEmpty.length}
          </span>
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('criticalEmpty')}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('rhythmMap')}</h3>
        <svg ref={svgRef} className="w-full" height={200} />
        <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">{t('redCritical')}</p>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                ins.type === 'warning'
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : ins.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <span className="flex-shrink-0 mt-0.5">
                {ins.type === 'warning' ? '⚠️' : ins.type === 'success' ? '✅' : '💡'}
              </span>
              <p className="leading-relaxed">{ins.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty stages */}
      {emptyStages.length > 0 && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{t('emptyStages')}</h3>
          <div className="space-y-2">
            {emptyStages.map((s) => (
              <div key={s.stageId} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.isCritical ? 'bg-red-500' : 'bg-[var(--border-color)]'}`} />
                <span>{s.stageName}</span>
                {s.isCritical && (
                  <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">{t('critical')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
