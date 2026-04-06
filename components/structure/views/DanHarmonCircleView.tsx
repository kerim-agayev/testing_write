'use client';

import { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import * as d3 from 'd3';
import type { StructureStage } from '@/lib/structure/data';
import { AssignedSceneChip } from '../AssignedSceneChip';

interface DanHarmonCircleViewProps {
  stages: StructureStage[];
  assignments: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onStageClick: (stageId: string) => void;
}

function toRad(deg: number) { return (deg * Math.PI) / 180; }

function HarmonDropZone({ stage, assignments, isActive, locale, onRemove, onClick }: {
  stage: StructureStage;
  assignments: any[];
  isActive: boolean;
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onClick: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `stage-${stage.id}`,
    data: { type: 'stage', stageId: stage.id },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`p-2.5 rounded-lg border-2 cursor-pointer min-h-[80px] transition-all
        ${isOver ? 'border-dashed scale-[1.02]' : isActive ? 'border-solid' : 'border-[var(--border-color)]'}`}
      style={{
        borderColor: isOver || isActive ? stage.color : undefined,
        background: isOver ? `${stage.color}15` : isActive ? stage.colorLight : 'var(--surface-card)',
      }}
    >
      <p className="text-[10px] font-semibold mb-1.5" style={{ color: stage.color }}>
        {stage.name[locale]}
      </p>
      <div className="space-y-1">
        {assignments.map((a: any) => (
          <AssignedSceneChip key={a.id} assignment={a} stageColor={stage.color} onRemove={() => onRemove(a.id)} />
        ))}
        {assignments.length === 0 && !isOver && (
          <p className="text-[10px] text-[var(--text-muted)] italic">
            {locale === 'az' ? 'sürüklə...' : locale === 'ru' ? 'перетащите...' : 'drag...'}
          </p>
        )}
      </div>
    </div>
  );
}

export function DanHarmonCircleView({ stages, assignments, locale, onRemove, onStageClick }: DanHarmonCircleViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const size = 560;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 220;
  const innerR = 110;

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    stages.forEach((stage) => {
      if (stage.arcStart === undefined || stage.arcEnd === undefined) return;
      const startRad = toRad(stage.arcStart - 90);
      const endRad = toRad(stage.arcEnd - 90);
      const midAngle = (stage.arcStart + stage.arcEnd) / 2;
      const midRad = toRad(midAngle - 90);

      const arcGen = d3.arc<any>();
      const arcPath = arcGen({
        innerRadius: innerR,
        outerRadius: outerR,
        startAngle: startRad,
        endAngle: endRad < startRad ? endRad + Math.PI * 2 : endRad,
      });

      const isActive = activeStage === stage.id;
      const hasScenes = assignments.some((a: any) => a.structureStageId === stage.id);
      const scenesCount = assignments.filter((a: any) => a.structureStageId === stage.id).length;

      g.append('path')
        .attr('d', arcPath)
        .attr('fill', `${stage.color}${isActive ? 'FF' : hasScenes ? 'CC' : '40'}`)
        .attr('stroke', 'var(--surface-base)')
        .attr('stroke-width', 3)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setActiveStage(stage.id);
          onStageClick(stage.id);
        })
        .on('mouseover', function () { d3.select(this).attr('fill', stage.color); })
        .on('mouseout', function () {
          d3.select(this).attr('fill', `${stage.color}${isActive ? 'FF' : hasScenes ? 'CC' : '40'}`);
        });

      // Label outside
      const labelR = outerR + 32;
      g.append('text')
        .attr('x', Math.cos(midRad) * labelR)
        .attr('y', Math.sin(midRad) * labelR + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('font-weight', '600')
        .attr('fill', stage.color)
        .attr('pointer-events', 'none')
        .text(stage.name[locale].split(' — ')[0]);

      // Scene count inside slice
      if (scenesCount > 0) {
        const countR = (innerR + outerR) / 2;
        g.append('circle')
          .attr('cx', Math.cos(midRad) * countR)
          .attr('cy', Math.sin(midRad) * countR)
          .attr('r', 12)
          .attr('fill', 'white')
          .attr('opacity', 0.9)
          .attr('pointer-events', 'none');
        g.append('text')
          .attr('x', Math.cos(midRad) * countR)
          .attr('y', Math.sin(midRad) * countR + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', 11)
          .attr('font-weight', 'bold')
          .attr('fill', stage.color)
          .attr('pointer-events', 'none')
          .text(scenesCount);
      }
    });

    // Center circle
    g.append('circle').attr('r', innerR)
      .attr('fill', 'var(--surface-card)')
      .attr('stroke', 'var(--border-color)').attr('stroke-width', 2);
    g.append('text').attr('text-anchor', 'middle').attr('y', -6)
      .attr('font-size', 14).attr('font-weight', 'bold')
      .attr('fill', 'var(--text-primary)').text('Story');
    g.append('text').attr('text-anchor', 'middle').attr('y', 12)
      .attr('font-size', 14).attr('font-weight', 'bold')
      .attr('fill', 'var(--text-primary)').text('Circle');
  }, [stages, assignments, activeStage, locale]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width={size} height={size} className="overflow-visible" />

      <div className="mt-6 w-full max-w-2xl">
        <p className="text-xs text-[var(--text-muted)] text-center mb-3">
          {locale === 'az' ? 'Dairəyə sürüklə ya da aşağıdan seç' : locale === 'ru' ? 'Перетащите на круг или выберите ниже' : 'Drag to circle or select below'}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {stages.map((stage) => (
            <HarmonDropZone
              key={stage.id}
              stage={stage}
              assignments={assignments.filter((a: any) => a.structureStageId === stage.id)}
              isActive={activeStage === stage.id}
              locale={locale}
              onRemove={onRemove}
              onClick={() => {
                setActiveStage(stage.id);
                onStageClick(stage.id);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
