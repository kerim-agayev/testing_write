import Link from 'next/link';
import { getDemoScreenplay } from '@/lib/db/screenplays';
import { Sparkles, GitBranch, FileText } from 'lucide-react';

export default async function LandingPage() {
  const demo = await getDemoScreenplay();

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Navigation */}
      <nav className="h-16 px-6 md:px-12 flex items-center justify-between max-w-[1400px] mx-auto">
        <span className="text-xl font-semibold text-primary tracking-tight">ScriptFlow</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-txt-secondary hover:text-txt-primary transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold text-txt-on-primary rounded bg-gradient-to-br from-primary-darkest to-primary hover:from-primary-dark hover:to-[#3A3880] transition-all"
          >
            Start Writing
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 items-center">
          {/* Left: Text */}
          <div>
            <h1 className="text-5xl md:text-[48px] font-semibold text-txt-primary leading-[1.15] tracking-[-0.02em] mb-4">
              Write deeper.<br />See the story.
            </h1>
            <p className="text-lg text-txt-secondary leading-[1.7] mb-8 max-w-md">
              Professional screenplay writing with character arc tracking, Story Grid analytics, and mentor collaboration — all in one place.
            </p>
            <div className="flex gap-4">
              <Link
                href="/register"
                className="px-6 py-3 text-[15px] font-semibold text-txt-on-primary rounded bg-gradient-to-br from-primary-darkest to-primary hover:from-primary-dark hover:to-[#3A3880] transition-all"
              >
                Start Writing Free
              </Link>
              <a
                href="#demo"
                className="px-6 py-3 text-[15px] font-medium text-primary border border-primary rounded hover:bg-[#F0F0F9] transition-all"
              >
                See Live Demo
              </a>
            </div>
          </div>

          {/* Right: Demo preview */}
          <div id="demo" className="relative">
            {/* Sticky banner */}
            <div className="bg-primary text-txt-on-primary text-xs font-medium text-center py-2 rounded-t-lg">
              Sign in to start writing with ScriptFlow →
            </div>
            {/* Demo editor preview */}
            <div className="bg-surface-card border border-border rounded-b-lg shadow-2 overflow-hidden" style={{ height: '60vh', maxHeight: 600 }}>
              <div className="flex h-full">
                {/* Mini left panel */}
                <div className="w-48 bg-surface-panel p-3 border-r border-border hidden md:block">
                  <p className="text-[10px] font-semibold uppercase text-txt-muted mb-2">Structure</p>
                  {demo?.acts.map((act) => (
                    <div key={act.id} className="mb-2">
                      <p className="text-xs font-medium text-txt-secondary">{act.title}</p>
                      {act.structures?.map((str) =>
                        str.sequences?.map((seq) =>
                          seq.scenes?.map((scene) => (
                            <p key={scene.id} className="text-[10px] text-txt-muted pl-2 py-0.5 truncate">
                              <span className="font-mono mr-1">{scene.sceneNumber}.</span>
                              {scene.synopsis || `${scene.intExt}. Scene`}
                            </p>
                          ))
                        )
                      )}
                    </div>
                  ))}
                </div>

                {/* Mini center */}
                <div className="flex-1 bg-surface-base p-4 overflow-y-auto">
                  <div className="max-w-md mx-auto bg-white shadow-1 rounded p-8 font-screenplay text-[10pt] leading-normal">
                    {demo?.acts[0]?.structures?.[0]?.sequences?.[0]?.scenes?.[0] && (() => {
                      const scene = demo.acts[0].structures[0].sequences[0].scenes[0];
                      const content = scene.content as { content?: Array<{ type: string; content?: Array<{ text: string }> }> };
                      return (
                        <>
                          {content?.content?.map((node, i) => {
                            const text = node.content?.map((c) => c.text).join('') || '';
                            if (node.type === 'sceneHeading') return <p key={i} className="uppercase font-bold mb-3">{text}</p>;
                            if (node.type === 'action') return <p key={i} className="mb-3">{text}</p>;
                            if (node.type === 'characterName') return <p key={i} className="uppercase text-center mt-3">{text}</p>;
                            if (node.type === 'dialogue') return <p key={i} className="mx-8 mb-3">{text}</p>;
                            return <p key={i}>{text}</p>;
                          })}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Mini right panel */}
                <div className="w-44 bg-surface-panel p-3 border-l border-border hidden lg:block">
                  <p className="text-[10px] font-semibold uppercase text-txt-muted mb-2">Story Data</p>
                  <div className="space-y-2 text-[10px]">
                    <div><span className="text-txt-muted">Event:</span> <span className="text-txt-secondary">Discovery</span></div>
                    <div><span className="text-txt-muted">Value:</span> <span className="text-txt-secondary">Routine → Discovery</span></div>
                    <div><span className="text-txt-muted">Score:</span> <span className="font-mono text-accent">60</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: 'Story Grid Automation', desc: 'Automatically populate your Story Grid with scene-level value shifts, polarity tracking, and turning point identification.' },
            { icon: GitBranch, title: 'Character Arc Tracking', desc: 'Dual-line internal/external arc charts for every major character. See the journey across scenes, episodes, and seasons.' },
            { icon: FileText, title: 'Film & TV Series Support', desc: 'Full screenplay hierarchy: Act → Structure → Sequence → Scene. With per-episode and per-season arc visualization.' },
          ].map((f) => (
            <div key={f.title} className="bg-surface-card border border-border rounded-lg p-6 hover:shadow-2 transition-all">
              <f.icon className="w-6 h-6 text-accent mb-3" />
              <h3 className="text-base font-semibold text-txt-primary mb-2">{f.title}</h3>
              <p className="text-sm text-txt-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-darkest text-txt-on-primary/70 py-10 mt-12">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-white">ScriptFlow</span>
            <p className="text-xs mt-1">The Cinematic Archive</p>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} ScriptFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
