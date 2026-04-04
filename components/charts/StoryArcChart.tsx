'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';

interface DataPoint {
  sceneId: string;
  sceneNumber: number;
  score: number | null;
  storyEvent?: string | null;
  turningPoint?: boolean | null;
  location?: string | null;
}

export function StoryArcChart({ data, screenplayId }: { data: DataPoint[]; screenplayId: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = svgRef.current.clientWidth || 900;
    const margin = { top: 24, right: 24, bottom: 56, left: 56 };
    const h = 400 - margin.top - margin.bottom;

    const minPointSpacing = 12;
    const svgWidth = Math.max(containerWidth, data.length * minPointSpacing + margin.left + margin.right);
    svg.attr('width', svgWidth).attr('height', 400);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const drawW = svgWidth - margin.left - margin.right;

    const x = d3.scaleLinear().domain([1, d3.max(data, d => d.sceneNumber) ?? 1]).range([0, drawW]);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    // Background zones
    g.append('rect').attr('x', 0).attr('y', 0).attr('width', drawW).attr('height', y(50)).attr('fill', 'rgba(29,158,117,0.06)');
    g.append('rect').attr('x', 0).attr('y', y(50)).attr('width', drawW).attr('height', h - y(50)).attr('fill', 'rgba(192,57,43,0.04)');

    // Grid
    [0, 25, 50, 75, 100].forEach(tick => {
      g.append('line').attr('x1', 0).attr('x2', drawW).attr('y1', y(tick)).attr('y2', y(tick))
        .attr('stroke', '#E8E6DF').attr('stroke-width', tick === 50 ? 1 : 0.5).attr('stroke-dasharray', tick === 50 ? '0' : '4,4');
    });

    // Y Axis
    g.append('g').call(d3.axisLeft(y).tickValues([0, 25, 50, 75, 100]).tickFormat(d => `${d}`))
      .call(ag => ag.select('.domain').remove())
      .call(ag => ag.selectAll('.tick text').attr('font-size', 10).attr('font-family', 'JetBrains Mono, monospace').attr('fill', '#9B9890'));

    // X Axis
    const maxScene = d3.max(data, d => d.sceneNumber) ?? 1;
    const tickStep = maxScene <= 20 ? 1 : maxScene <= 50 ? 5 : maxScene <= 100 ? 10 : 20;
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickValues(d3.range(1, maxScene + 1, tickStep)).tickFormat(d => `${d}`))
      .call(ag => ag.select('.domain').attr('stroke', '#E8E6DF'))
      .call(ag => ag.selectAll('.tick text').attr('font-size', 10).attr('font-family', 'JetBrains Mono, monospace').attr('fill', '#9B9890'));

    // Scored vs unscored
    const scored = data.filter(d => d.score !== null) as (DataPoint & { score: number })[];

    // Unscored — dotted circles at y=50
    data.filter(d => d.score === null).forEach(d => {
      g.append('circle').attr('cx', x(d.sceneNumber)).attr('cy', y(50)).attr('r', 3)
        .attr('fill', 'none').attr('stroke', '#9B9890').attr('stroke-width', 1.5).attr('stroke-dasharray', '2,2');
    });

    // Line + area for scored
    if (scored.length > 1) {
      const line = d3.line<DataPoint & { score: number }>().x(d => x(d.sceneNumber)).y(d => y(d.score)).curve(d3.curveMonotoneX);
      const path = g.append('path').datum(scored).attr('fill', 'none').attr('stroke', '#2D2B6B').attr('stroke-width', 2).attr('d', line);
      const len = (path.node() as SVGPathElement)?.getTotalLength() ?? 0;
      path.attr('stroke-dasharray', `${len} ${len}`).attr('stroke-dashoffset', len)
        .transition().duration(800).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0);

      const area = d3.area<DataPoint & { score: number }>().x(d => x(d.sceneNumber)).y0(h).y1(d => y(d.score)).curve(d3.curveMonotoneX);
      g.append('path').datum(scored).attr('fill', 'rgba(45,43,107,0.05)').attr('d', area);
    }

    // Turning point markers
    data.filter(d => d.turningPoint).forEach(d => {
      g.append('line').attr('x1', x(d.sceneNumber)).attr('x2', x(d.sceneNumber)).attr('y1', 0).attr('y2', h)
        .attr('stroke', '#E67E22').attr('stroke-width', 1).attr('stroke-dasharray', '4,3').attr('opacity', 0.5);
    });

    // Clickable dots
    g.selectAll('.arc-dot').data(data).join('circle')
      .attr('class', 'arc-dot')
      .attr('cx', d => x(d.sceneNumber))
      .attr('cy', d => d.score !== null ? y(d.score) : y(50))
      .attr('r', d => d.turningPoint ? 5 : 3)
      .attr('fill', d => d.score === null ? '#9B9890' : d.turningPoint ? '#E67E22' : '#2D2B6B')
      .attr('stroke', 'white').attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(100).attr('r', 6);
        const tip = document.getElementById('arc-chart-tooltip');
        if (!tip) return;
        tip.style.display = 'block';
        tip.style.left = `${event.pageX + 12}px`;
        tip.style.top = `${event.pageY - 40}px`;
        tip.innerHTML = `<div style="background:#fff;border:1px solid #E8E6DF;border-radius:6px;padding:6px 10px;font-family:JetBrains Mono,monospace;font-size:11px;box-shadow:0 4px 12px rgba(0,0,0,0.08);max-width:220px;">
          <strong>Scene ${d.sceneNumber}</strong> — ${d.score !== null ? `${d.score}/100` : 'no score'}<br/>
          ${d.location ? `<span style="color:#6B6960">${d.location}</span><br/>` : ''}
          ${d.storyEvent ? `<span style="color:#6B6960;font-size:10px;">${(d.storyEvent ?? '').substring(0, 55)}${(d.storyEvent ?? '').length > 55 ? '...' : ''}</span>` : ''}
          ${d.turningPoint ? '<br/><span style="color:#E67E22">★ Turning Point</span>' : ''}
        </div>`;
      })
      .on('mouseout', function (_, d) {
        d3.select(this).transition().duration(100).attr('r', d.turningPoint ? 5 : 3);
        const tip = document.getElementById('arc-chart-tooltip');
        if (tip) tip.style.display = 'none';
      })
      .on('click', (_, d) => {
        router.push(`/screenplay/${screenplayId}/edit?scene=${d.sceneId}`);
      });
  }, [data, screenplayId, router]);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} style={{ minWidth: '100%', height: 400 }} />
      </div>
      <div id="arc-chart-tooltip" style={{ display: 'none', position: 'fixed', pointerEvents: 'none', zIndex: 9999 }} />
    </>
  );
}
