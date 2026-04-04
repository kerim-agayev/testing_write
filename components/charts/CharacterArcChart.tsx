'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';

interface ArcPoint {
  sceneId: string;
  sceneNumber: number;
  externalScore: number | null;
  internalScore: number | null;
}

export function CharacterArcChart({ data, characterName, screenplayId }: {
  data: ArcPoint[];
  characterName: string;
  screenplayId: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = svgRef.current.clientWidth || 700;
    const margin = { top: 20, right: 24, bottom: 50, left: 50 };
    const w = containerWidth - margin.left - margin.right;
    const h = 280 - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const scored = data.filter(d => d.externalScore !== null || d.internalScore !== null);
    if (scored.length === 0) {
      g.append('text').attr('x', w / 2).attr('y', h / 2).attr('text-anchor', 'middle')
        .attr('font-size', 12).attr('fill', '#9B9890').attr('font-family', 'JetBrains Mono, monospace')
        .text(`No arc data for ${characterName}`);
      return;
    }

    const maxScene = d3.max(scored, d => d.sceneNumber) ?? 1;
    const x = d3.scaleLinear().domain([1, maxScene]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    // Grid
    [0, 25, 50, 75, 100].forEach(t => {
      g.append('line').attr('x1', 0).attr('x2', w).attr('y1', y(t)).attr('y2', y(t))
        .attr('stroke', '#E8E6DF').attr('stroke-width', 0.5).attr('stroke-dasharray', '4,4');
    });

    // Axes
    g.append('g').call(d3.axisLeft(y).tickValues([0, 25, 50, 75, 100]).tickFormat(d => `${d}`))
      .call(ag => ag.select('.domain').remove())
      .call(ag => ag.selectAll('.tick text').attr('font-size', 10).attr('font-family', 'JetBrains Mono, monospace').attr('fill', '#9B9890'));

    const tickStep = maxScene <= 20 ? 1 : maxScene <= 50 ? 5 : 10;
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickValues(d3.range(1, maxScene + 1, tickStep)).tickFormat(d => `${d}`))
      .call(ag => ag.select('.domain').attr('stroke', '#E8E6DF'))
      .call(ag => ag.selectAll('.tick text').attr('font-size', 10).attr('font-family', 'JetBrains Mono, monospace').attr('fill', '#9B9890'));

    // External line (solid teal)
    const extData = scored.filter(d => d.externalScore !== null) as (ArcPoint & { externalScore: number })[];
    if (extData.length > 1) {
      const extLine = d3.line<typeof extData[0]>().x(d => x(d.sceneNumber)).y(d => y(d.externalScore)).curve(d3.curveMonotoneX);
      const ep = g.append('path').datum(extData).attr('fill', 'none').attr('stroke', '#1D9E75').attr('stroke-width', 2).attr('d', extLine);
      const el = (ep.node() as SVGPathElement)?.getTotalLength() ?? 0;
      ep.attr('stroke-dasharray', `${el} ${el}`).attr('stroke-dashoffset', el)
        .transition().duration(800).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0);
    }

    // Internal line (dashed indigo)
    const intData = scored.filter(d => d.internalScore !== null) as (ArcPoint & { internalScore: number })[];
    if (intData.length > 1) {
      const intLine = d3.line<typeof intData[0]>().x(d => x(d.sceneNumber)).y(d => y(d.internalScore)).curve(d3.curveMonotoneX);
      g.append('path').datum(intData).attr('fill', 'none').attr('stroke', '#2D2B6B').attr('stroke-width', 2).attr('stroke-dasharray', '6,3').attr('d', intLine);
    }

    // Dots
    const allDots = [
      ...extData.map(d => ({ ...d, type: 'ext' as const, val: d.externalScore, color: '#1D9E75' })),
      ...intData.map(d => ({ ...d, type: 'int' as const, val: d.internalScore, color: '#2D2B6B' })),
    ];

    g.selectAll('.arc-char-dot').data(allDots).join('circle')
      .attr('cx', d => x(d.sceneNumber)).attr('cy', d => y(d.val))
      .attr('r', 3.5).attr('fill', d => d.color).attr('stroke', 'white').attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 5.5);
        const tip = document.getElementById('char-arc-tooltip');
        if (!tip) return;
        tip.style.display = 'block';
        tip.style.left = `${event.pageX + 12}px`;
        tip.style.top = `${event.pageY - 40}px`;
        tip.innerHTML = `<div style="background:#fff;border:1px solid #E8E6DF;border-radius:6px;padding:6px 10px;font-family:JetBrains Mono,monospace;font-size:11px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <strong>Scene ${d.sceneNumber}</strong><br/>
          ${d.type === 'ext' ? `<span style="color:#1D9E75">External: ${d.val}/100</span>` : `<span style="color:#2D2B6B">Internal: ${d.val}/100</span>`}
        </div>`;
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 3.5);
        const tip = document.getElementById('char-arc-tooltip');
        if (tip) tip.style.display = 'none';
      })
      .on('click', (_, d) => router.push(`/screenplay/${screenplayId}/edit?scene=${d.sceneId}`));

    // Legend
    const legend = g.append('g').attr('transform', `translate(${w - 160}, ${-10})`);
    [['#1D9E75', '0', 'External'], ['#2D2B6B', '6,3', 'Internal']].forEach(([color, dash, label], i) => {
      const lg = legend.append('g').attr('transform', `translate(${i * 80}, 0)`);
      lg.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 6).attr('y2', 6)
        .attr('stroke', color).attr('stroke-width', 2).attr('stroke-dasharray', dash);
      lg.append('text').attr('x', 22).attr('y', 10).attr('font-size', 10).attr('fill', '#6B6960')
        .attr('font-family', 'JetBrains Mono, monospace').text(label);
    });
  }, [data, characterName, screenplayId, router]);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} style={{ minWidth: '100%', height: 280 }} />
      </div>
      <div id="char-arc-tooltip" style={{ display: 'none', position: 'fixed', pointerEvents: 'none', zIndex: 9999 }} />
    </>
  );
}
