'use client';

import { useState } from 'react';

type DemoScene = {
  id: string;
  sceneNumber: number;
  intExt: string;
  timeOfDay: string | null;
  synopsis: string | null;
  content: unknown;
  storyEvent: string | null;
  valueShift: string | null;
  polarityShift: string | null;
  storyValueScore: number | null;
};

type DemoAct = {
  id: string;
  title: string;
  structures: Array<{
    sequences: Array<{
      scenes: DemoScene[];
    }>;
  }>;
};

type DemoScreenplay = {
  title: string;
  acts: DemoAct[];
  characters: Array<{ id: string; name: string; roleType: string }>;
};

function getAllScenes(acts: DemoAct[]): DemoScene[] {
  return acts.flatMap(act =>
    act.structures.flatMap(s =>
      s.sequences.flatMap(seq => seq.scenes)
    )
  );
}

export function DemoEditorPreview({ screenplay }: { screenplay: DemoScreenplay }) {
  const allScenes = getAllScenes(screenplay.acts);
  const [activeScene, setActiveScene] = useState<DemoScene | null>(allScenes[0] ?? null);

  return (
    <div
      className="border border-[var(--border-color)] rounded-b-lg overflow-hidden shadow-2"
      style={{ height: '75vh', maxHeight: 650, display: 'grid', gridTemplateColumns: '200px 1fr 220px' }}
    >
      {/* Left panel */}
      <div className="bg-[var(--surface-panel)] border-r border-[var(--border-color)] overflow-y-auto p-3">
        <p className="text-[10px] font-semibold uppercase text-[var(--text-muted)] mb-3 tracking-wide">Navigator</p>
        {screenplay.acts.map(act => (
          <div key={act.id} className="mb-3">
            <p className="text-[11px] font-medium text-[var(--text-secondary)] mb-1">{act.title}</p>
            {act.structures.flatMap(s => s.sequences.flatMap(seq =>
              seq.scenes.map(scene => (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(scene)}
                  className={`w-full text-left px-2 py-1.5 text-[11px] rounded mb-0.5 transition-colors ${
                    activeScene?.id === scene.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-card)]'
                  }`}
                >
                  <span className="font-mono mr-1">{scene.sceneNumber}.</span>
                  {scene.synopsis || `${scene.intExt}. Scene`}
                </button>
              ))
            ))}
          </div>
        ))}

        {/* Characters */}
        <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
          <p className="text-[10px] font-semibold uppercase text-[var(--text-muted)] mb-2 tracking-wide">Characters</p>
          <div className="flex flex-wrap gap-1">
            {screenplay.characters.map(c => (
              <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)]">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Center panel */}
      <div className="bg-[var(--surface-base)] overflow-y-auto flex justify-center py-6">
        {activeScene && (
          <div
            className="bg-[var(--screenplay-page-bg)] shadow-1 h-fit"
            style={{
              width: '100%',
              maxWidth: '580px',
              padding: '56px 56px 56px 80px',
              fontFamily: 'var(--font-screenplay, "Courier Prime", "Courier New", monospace)',
              fontSize: '11pt',
              lineHeight: '1.3',
              color: 'var(--screenplay-text)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <RenderContent content={activeScene.content} />
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="bg-[var(--surface-panel)] border-l border-[var(--border-color)] overflow-y-auto p-4">
        <p className="text-[10px] font-semibold uppercase text-[var(--text-muted)] mb-3 tracking-wide">Scene Analysis</p>
        {activeScene && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Story Event</p>
              <p className="text-xs text-[var(--text-primary)]">{activeScene.storyEvent || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Value Shift</p>
              <p className="text-xs font-medium text-[var(--text-primary)]">{activeScene.valueShift || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Polarity</p>
              <p className="text-xs text-[var(--text-primary)]">{activeScene.polarityShift || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Scene Value</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${activeScene.storyValueScore ?? 0}%`,
                      backgroundColor: (activeScene.storyValueScore ?? 0) <= 30 ? '#C0392B' : (activeScene.storyValueScore ?? 0) <= 69 ? '#E67E22' : '#1D9E75',
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{activeScene.storyValueScore ?? 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RenderContent({ content }: { content: unknown }) {
  const doc = content as { content?: Array<{ type: string; content?: Array<{ text: string }> }> } | null;
  if (!doc?.content) return null;

  return (
    <>
      {doc.content.map((block, i) => {
        const text = block.content?.map(n => n.text).join('') ?? '';
        switch (block.type) {
          case 'sceneHeading':
            return <p key={i} className="uppercase font-bold mt-6 first:mt-0 mb-1">{text}</p>;
          case 'actionLine':
          case 'action':
            return <p key={i} className="mt-3 mb-1">{text}</p>;
          case 'characterName':
            return <p key={i} className="uppercase text-center mt-4 mb-0" style={{ paddingLeft: '2in' }}>{text}</p>;
          case 'dialogue':
            return <p key={i} className="mb-1" style={{ marginLeft: '1.2in', marginRight: '1.2in' }}>{text}</p>;
          case 'parenthetical':
            return <p key={i} className="italic mb-0" style={{ marginLeft: '1.6in' }}>{text}</p>;
          case 'transition':
            return <p key={i} className="uppercase text-right mt-4">{text}</p>;
          default:
            return <p key={i}>{text}</p>;
        }
      })}
    </>
  );
}
