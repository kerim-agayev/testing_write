'use client';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useLocale, useTranslations } from 'next-intl';
import { KRONOTOPLAR } from '@/lib/kronotop/data';

type Locale = 'az' | 'en' | 'ru';

interface StatsData {
  distribution: Array<{ kronotopId: string; count: number; color: string; icon?: string }>;
  totalScenes: number;
  scenesWithKronotop: number;
  scenesWithoutKronotop: number;
  totalAssignments: number;
  avgKronotopPerScene: number;
}

interface Props {
  stats: StatsData | undefined;
}

export function KronotopStatsView({ stats }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const locale = useLocale() as Locale;
  const t = useTranslations('kronotop.stats');

  useEffect(() => {
    if (!svgRef.current || !stats?.distribution?.length) return;
    const data = stats.distribution.slice(0, 15);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 80, bottom: 30, left: 180 };
    const w = svgRef.current.clientWidth - margin.left - margin.right;
    const h = data.length * 42;

    svg.attr('height', h + margin.top + margin.bottom);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.count) ?? 1]).range([0, w]);
    const y = d3.scaleBand<string>().domain(data.map(d => d.kronotopId)).range([0, h]).padding(0.25);

    g.selectAll('.bar')
      .data(data).join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.kronotopId) ?? 0)
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .attr('width', 0)
      .transition().duration(600).ease(d3.easeCubicOut)
      .attr('width', d => x(d.count));

    g.selectAll('.label')
      .data(data).join('text')
      .attr('x', d => x(d.count) + 6)
      .attr('y', d => (y(d.kronotopId) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', 'var(--text-secondary)')
      .text(d => `${d.count}`);

    g.selectAll('.axis-label')
      .data(data).join('text')
      .attr('x', -8)
      .attr('y', d => (y(d.kronotopId) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', 12).attr('font-family', 'Inter, sans-serif')
      .attr('fill', 'var(--text-primary)')
      .text(d => {
        const k = KRONOTOPLAR.find(k => k.id === d.kronotopId);
        const name = k?.name[locale] ?? d.kronotopId;
        return `${k?.icon ?? ''} ${name.substring(0, 22)}${name.length > 22 ? '...' : ''}`;
      });
  }, [stats, locale]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summaryCards = [
    { label: t('totalAssignments'), value: stats.totalAssignments },
    { label: t('withKronotop'), value: stats.scenesWithKronotop },
    { label: t('withoutKronotop'), value: stats.scenesWithoutKronotop },
    { label: t('avgPerScene'), value: stats.avgKronotopPerScene },
  ];

  return (
    <div className="p-6 overflow-y-auto flex-1">
      <div className="grid grid-cols-4 gap-4 mb-8">
        {summaryCards.map(card => (
          <div key={card.label} className="p-4 bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl">
            <p className="text-2xl font-bold text-[var(--text-primary)] font-mono mb-1">{card.value}</p>
            <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{t('title')}</h3>
        {stats.distribution.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic text-center py-8">{t('noData')}</p>
        ) : (
          <svg ref={svgRef} className="w-full" />
        )}
      </div>
    </div>
  );
}
