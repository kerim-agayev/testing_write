'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import * as d3 from 'd3';
import type { StructureStage } from '@/lib/structure/data';
import { AssignedSceneChip } from '../AssignedSceneChip';

interface DanHarmonCircleViewProps {
  stages: StructureStage[];
  assignments: any[];
  scenes: any[];
  locale: 'az' | 'en' | 'ru';
  onRemove: (id: string) => void;
  onAssign: (sceneId: string, stageId: string) => void;
  onStageClick: (stageId: string) => void;
}

export function DanHarmonCircleView({ stages, assignments, scenes, locale, onRemove, onAssign, onStageClick }: DanHarmonCircleViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [modalStageId, setModalStageId] = useState<string | null>(null);
  const size = 500;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 200;
  const innerR = 100;

  const assignedSceneIds = new Set(assignments.map((a: any) => a.sceneId));

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    // Compute slice angles fresh from stage order — this ensures path & label
    // use the SAME coordinate system. d3.arc convention: 0 rad = top (12 o'clock),
    // increases clockwise. First stage centered at top.
    const SLICE_COUNT = stages.length;
    const SLICE_ANGLE = (Math.PI * 2) / SLICE_COUNT;
    const arcGen = d3.arc<any>();

    stages.forEach((stage, i) => {
      const startAngle = i * SLICE_ANGLE - SLICE_ANGLE / 2;
      const endAngle = startAngle + SLICE_ANGLE;
      const midAngle = (startAngle + endAngle) / 2;

      // SVG position from d3.arc angle: x = r*sin(a), y = -r*cos(a)
      const sinMid = Math.sin(midAngle);
      const cosMid = Math.cos(midAngle);

      const arcPath = arcGen({
        innerRadius: innerR,
        outerRadius: outerR,
        startAngle,
        endAngle,
      });

      const isActive = activeStage === stage.id;
      const hasScenes = assignments.some((a: any) => a.structureStageId === stage.id);
      const scenesCount = assignments.filter((a: any) => a.structureStageId === stage.id).length;

      // Slice
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
        .on('mouseover', function () { d3.select(this).attr('fill', `${stage.color}DD`); })
        .on('mouseout', function () {
          d3.select(this).attr('fill', `${stage.color}${isActive ? 'FF' : hasScenes ? 'CC' : '40'}`);
        });

      // Label outside the slice
      const labelR = outerR + 28;
      g.append('text')
        .attr('x', sinMid * labelR)
        .attr('y', -cosMid * labelR + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('font-weight', '600')
        .attr('fill', stage.color)
        .attr('pointer-events', 'none')
        .text(stage.name[locale].split(' — ')[0]);

      // Scene count badge inside the slice
      if (scenesCount > 0) {
        const countR = (innerR + outerR) / 2;
        g.append('circle')
          .attr('cx', sinMid * countR)
          .attr('cy', -cosMid * countR)
          .attr('r', 13)
          .attr('fill', 'white')
          .attr('opacity', 0.9)
          .attr('pointer-events', 'none');
        g.append('text')
          .attr('x', sinMid * countR)
          .attr('y', -cosMid * countR + 4)
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
    <div className="flex gap-6 items-start">
      {/* Left: D3 Circle */}
      <div className="flex-shrink-0">
        <svg ref={svgRef} width={size} height={size} className="overflow-visible" />
      </div>

      {/* Right: Stage cards with scene assignments */}
      <div className="flex-1 min-w-[260px] space-y-2 overflow-y-auto max-h-[500px] pr-1">
        <p className="text-xs text-[var(--text-muted)] mb-2">
          {locale === 'az' ? 'Dairədən bir dilim seçin, sonra "+" ilə səhnə əlavə edin' : locale === 'ru' ? 'Выберите сектор на круге, затем добавьте сцену через "+"' : 'Click a slice on the circle, then add scenes with "+"'}
        </p>
        {stages.map((stage) => {
          const stageAssignments = assignments.filter((a: any) => a.structureStageId === stage.id);
          const isActive = activeStage === stage.id;

          return (
            <div
              key={stage.id}
              className={`rounded-lg border-2 transition-all ${isActive ? 'border-solid shadow-sm' : 'border-[var(--border-color)]'}`}
              style={{ borderColor: isActive ? stage.color : undefined }}
            >
              <div
                className="flex items-center justify-between p-2.5 cursor-pointer"
                style={{ background: isActive ? stage.colorLight : undefined }}
                onClick={() => { setActiveStage(stage.id); onStageClick(stage.id); }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                  <span className="text-xs font-semibold" style={{ color: stage.color }}>
                    {stage.name[locale]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{stageAssignments.length}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalStageId(stage.id); setActiveStage(stage.id); onStageClick(stage.id); }}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--surface-hover)] transition-colors"
                    style={{ color: stage.color }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {stageAssignments.length > 0 && (
                <div className="px-2.5 pb-2 space-y-1">
                  {stageAssignments.map((a: any) => (
                    <AssignedSceneChip key={a.id} assignment={a} stageColor={stage.color} onRemove={() => onRemove(a.id)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scene selection modal */}
      {modalStageId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModalStageId(null)}>
          <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--border-color)] shadow-lg w-80 max-h-96 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {locale === 'az' ? 'Səhnə seçin' : locale === 'ru' ? 'Выберите сцену' : 'Select scene'}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {stages.find((s) => s.id === modalStageId)?.name[locale]}
                </p>
              </div>
              <button onClick={() => setModalStageId(null)}>
                <X size={14} className="text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-72 p-2 space-y-1">
              {scenes.filter((s: any) => !assignedSceneIds.has(s.id)).map((scene: any) => (
                <button
                  key={scene.id}
                  onClick={() => { onAssign(scene.id, modalStageId); setModalStageId(null); }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-left"
                >
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-5">{scene.sceneNumber}</span>
                  <span className="text-xs text-[var(--text-primary)] truncate">
                    {scene.intExt}. {scene.location?.name ?? '—'}
                  </span>
                </button>
              ))}
              {scenes.filter((s: any) => !assignedSceneIds.has(s.id)).length === 0 && (
                <p className="text-xs text-[var(--text-muted)] text-center py-4 italic">
                  {locale === 'az' ? 'Bütün səhnələr atanıb' : locale === 'ru' ? 'Все сцены назначены' : 'All scenes assigned'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
