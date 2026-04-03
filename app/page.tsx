import Link from 'next/link';
import { getDemoScreenplay } from '@/lib/db/screenplays';
import { Sparkles, GitBranch, FileText } from 'lucide-react';
import { DemoEditorPreview } from '@/components/landing/DemoEditorPreview';

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
            {demo ? (
              <DemoEditorPreview screenplay={demo} />
            ) : (
              <div className="bg-surface-card border border-border rounded-b-lg p-12 text-center">
                <p className="text-txt-secondary">Demo screenplay not loaded yet.</p>
                <code className="text-xs text-txt-muted block mt-2">npx prisma db seed</code>
              </div>
            )}
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
