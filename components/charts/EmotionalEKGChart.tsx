'use client';

import * as d3 from 'd3';
import { useRef, useEffect } from 'react';

interface SceneValue {
  sceneNumber: number;
  storyValueScore: number | null;
  turningPoint?: boolean;
}

export function EmotionalEKGChart({ scenes }: { scenes: SceneValue[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const validScenes = scenes.filter((s) => s.storyValueScore !== null);

  useEffect(() => {
    if (!svgRef.current || validScenes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 15, right: 20, bottom: 35, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([1, d3.max(validScenes, (d) => d.sceneNumber) ?? 1])
      .range([0, width]);

    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // Reference line at 50
    g.append('line')
      .attr('x1', 0).attr('y1', y(50))
      .attr('x2', width).attr('y2', y(50))
      .attr('stroke', 'var(--border-color)').attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.6);

    // Gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'ekg-gradient').attr('x1', '0').attr('x2', '0')
      .attr('y1', '0').attr('y2', '1');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#1D9E75').attr('stop-opacity', 0.3);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#1D9E75').attr('stop-opacity', 0);

    // Area (step)
    const area = d3.area<SceneValue>()
      .x((d) => x(d.sceneNumber))
      .y0(y(50))
      .y1((d) => y(d.storyValueScore!))
      .curve(d3.curveStepAfter);

    g.append('path')
      .datum(validScenes)
      .attr('fill', 'url(#ekg-gradient)')
      .attr('d', area as unknown as string);

    // Line (step)
    const line = d3.line<SceneValue>()
      .x((d) => x(d.sceneNumber))
      .y((d) => y(d.storyValueScore!))
      .curve(d3.curveStepAfter);

    g.append('path')
      .datum(validScenes)
      .attr('fill', 'none')
      .attr('stroke', '#1D9E75')
      .attr('stroke-width', 2)
      .attr('d', line as unknown as string);

    // Turning point markers
    validScenes.filter((d) => d.turningPoint).forEach((d) => {
      g.append('line')
        .attr('x1', x(d.sceneNumber)).attr('y1', 0)
        .attr('x2', x(d.sceneNumber)).attr('y2', height)
        .attr('stroke', '#E67E22').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3,3').attr('opacity', 0.7);

      g.append('circle')
        .attr('cx', x(d.sceneNumber)).attr('cy', y(d.storyValueScore!))
        .attr('r', 5).attr('fill', '#E67E22');
    });

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(Math.min(validScenes.length, 10)).tickFormat((d) => `S.${d}`))
      .call((ag) => ag.select('.domain').attr('stroke', 'var(--border-color)'))
      .call((ag) => ag.selectAll('.tick text').attr('font-size', 10).attr('fill', 'var(--text-muted)'));

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickValues([0, 25, 50, 75, 100]))
      .call((ag) => ag.select('.domain').attr('stroke', 'var(--border-color)'))
      .call((ag) => ag.selectAll('.tick text').attr('font-size', 10).attr('fill', 'var(--text-muted)'));
  }, [validScenes]);

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-color)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Dramatik EKG</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Hekayə dəyəri — bütün ssenari boyunca</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-[#1D9E75] rounded" />
            <span>Hekayə dəyəri</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#E67E22]" />
            <span>Dönüm nöqtəsi</span>
          </div>
        </div>
      </div>
      {validScenes.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-sm text-[var(--text-muted)] italic">
            Sahnələrə hekayə dəyəri skoru əlavə edin
          </p>
        </div>
      ) : (
        <svg ref={svgRef} className="w-full" height={200} />
      )}
    </div>
  );
}
