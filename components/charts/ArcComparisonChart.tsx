'use client';

import * as d3 from 'd3';
import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ArcDataPoint {
  sceneNumber: number;
  sceneId: string;
  char1Score: number | null;
  char2Score: number | null;
}

interface Props {
  screenplayId: string;
  characters: { id: string; name: string }[];
}

export function ArcComparisonChart({ screenplayId, characters }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [char1Id, setChar1Id] = useState('');
  const [char2Id, setChar2Id] = useState('');
  const [arcType, setArcType] = useState<'external' | 'internal'>('external');

  const { data = [] } = useQuery<ArcDataPoint[]>({
    queryKey: ['arc-comparison', screenplayId, char1Id, char2Id, arcType],
    queryFn: () =>
      fetch(`/api/screenplays/${screenplayId}/arc-comparison?char1Id=${char1Id}&char2Id=${char2Id}&arcType=${arcType}`)
        .then((r) => r.json()),
    enabled: !!char1Id && !!char2Id && char1Id !== char2Id,
  });

  const char1 = characters.find((c) => c.id === char1Id);
  const char2 = characters.find((c) => c.id === char2Id);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const validData = data.filter((d) => d.char1Score !== null && d.char2Score !== null);

    const x = d3.scaleLinear()
      .domain([1, d3.max(data, (d) => d.sceneNumber) ?? 1])
      .range([0, width]);

    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // Grid lines
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .call((ag) => ag.select('.domain').remove())
      .call((ag) => ag.selectAll('.tick line')
        .attr('stroke', 'var(--border-color)').attr('stroke-dasharray', '3,3').attr('opacity', 0.5));

    // Crossover markers
    for (let i = 0; i < validData.length - 1; i++) {
      const a = validData[i];
      const b = validData[i + 1];
      if ((a.char1Score! - a.char2Score!) * (b.char1Score! - b.char2Score!) < 0) {
        const crossX = a.sceneNumber + (b.sceneNumber - a.sceneNumber) *
          Math.abs(a.char1Score! - a.char2Score!) /
          (Math.abs(a.char1Score! - a.char2Score!) + Math.abs(b.char1Score! - b.char2Score!));
        const crossY = (a.char1Score! + b.char1Score!) / 2;

        g.append('circle')
          .attr('cx', x(crossX)).attr('cy', y(crossY))
          .attr('r', 8)
          .attr('fill', 'rgba(255, 200, 0, 0.3)')
          .attr('stroke', '#F1C40F')
          .attr('stroke-width', 2);

        g.append('text')
          .attr('x', x(crossX)).attr('y', y(crossY) - 14)
          .attr('text-anchor', 'middle').attr('font-size', 10)
          .attr('fill', '#F1C40F').attr('font-weight', 'bold')
          .text('⚡');
      }
    }

    // Character 1 line (Teal)
    const line1 = d3.line<ArcDataPoint>()
      .x((d) => x(d.sceneNumber))
      .y((d) => y(d.char1Score!))
      .curve(d3.curveMonotoneX)
      .defined((d) => d.char1Score !== null);

    g.append('path')
      .datum(validData)
      .attr('fill', 'none')
      .attr('stroke', '#1D9E75')
      .attr('stroke-width', 2.5)
      .attr('d', line1 as unknown as string);

    // Character 2 line (Orange)
    const line2 = d3.line<ArcDataPoint>()
      .x((d) => x(d.sceneNumber))
      .y((d) => y(d.char2Score!))
      .curve(d3.curveMonotoneX)
      .defined((d) => d.char2Score !== null);

    g.append('path')
      .datum(validData)
      .attr('fill', 'none')
      .attr('stroke', '#E67E22')
      .attr('stroke-width', 2.5)
      .attr('d', line2 as unknown as string);

    // Dots char1
    g.selectAll('.dot1').data(validData.filter((d) => d.char1Score !== null))
      .join('circle').attr('class', 'dot1')
      .attr('cx', (d) => x(d.sceneNumber)).attr('cy', (d) => y(d.char1Score!))
      .attr('r', 3.5).attr('fill', '#1D9E75');

    // Dots char2
    g.selectAll('.dot2').data(validData.filter((d) => d.char2Score !== null))
      .join('circle').attr('class', 'dot2')
      .attr('cx', (d) => x(d.sceneNumber)).attr('cy', (d) => y(d.char2Score!))
      .attr('r', 3.5).attr('fill', '#E67E22');

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(Math.min(data.length, 10)).tickFormat((d) => `S.${d}`))
      .call((ag) => ag.select('.domain').attr('stroke', 'var(--border-color)'))
      .call((ag) => ag.selectAll('.tick text').attr('font-size', 10).attr('fill', 'var(--text-muted)'));

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .call((ag) => ag.select('.domain').attr('stroke', 'var(--border-color)'))
      .call((ag) => ag.selectAll('.tick text').attr('font-size', 10).attr('fill', 'var(--text-muted)'));

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40).attr('x', -height / 2)
      .attr('text-anchor', 'middle').attr('font-size', 11)
      .attr('fill', 'var(--text-muted)')
      .text(arcType === 'external' ? 'External Arc Skoru' : 'Internal Arc Skoru');
  }, [data, arcType]);

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Güc Balansı Grafiği</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">İki personajın arc müqayisəsi — kim nə vaxt üstdədir?</p>
        </div>
        <div className="flex gap-1 bg-[var(--surface-panel)] rounded-lg p-0.5">
          {(['external', 'internal'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setArcType(type)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium
                ${arcType === type
                  ? 'bg-[var(--surface-card)] shadow-sm text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
            >
              {type === 'external' ? 'External' : 'Internal'}
            </button>
          ))}
        </div>
      </div>

      {/* Character selectors */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">
            <span className="inline-block w-3 h-3 rounded-full bg-[#1D9E75] mr-1.5" />
            1-ci Personaj
          </label>
          <select
            value={char1Id}
            onChange={(e) => setChar1Id(e.target.value)}
            className="w-full text-sm p-2 bg-[var(--surface-base)] border border-[var(--border-color)] rounded-lg focus:border-primary focus:outline-none"
          >
            <option value="">Seçin...</option>
            {characters.filter((c) => c.id !== char2Id).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">
            <span className="inline-block w-3 h-3 rounded-full bg-[#E67E22] mr-1.5" />
            2-ci Personaj
          </label>
          <select
            value={char2Id}
            onChange={(e) => setChar2Id(e.target.value)}
            className="w-full text-sm p-2 bg-[var(--surface-base)] border border-[var(--border-color)] rounded-lg focus:border-primary focus:outline-none"
          >
            <option value="">Seçin...</option>
            {characters.filter((c) => c.id !== char1Id).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      {char1 && char2 && (
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-[#1D9E75] rounded" />
            <span className="text-xs text-[var(--text-secondary)]">{char1.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-[#E67E22] rounded" />
            <span className="text-xs text-[var(--text-secondary)]">{char2.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-xs">⚡</span>
            <span className="text-xs text-[var(--text-muted)]">Güc keçişi</span>
          </div>
        </div>
      )}

      {!char1Id || !char2Id ? (
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-sm text-[var(--text-muted)] italic">Müqayisə üçün iki personaj seçin</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-sm text-[var(--text-muted)] italic">Bu personajlar üçün arc məlumatı yoxdur</p>
        </div>
      ) : (
        <svg ref={svgRef} className="w-full" height={280} />
      )}
    </div>
  );
}
