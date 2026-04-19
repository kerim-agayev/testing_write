import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { listScreenplays } from '@/lib/db/screenplays';
import { ScreenplayCard } from '@/components/screenplay/ScreenplayCard';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { PendingInvites } from '@/components/dashboard/PendingInvites';
import { INSPIRATIONAL_QUOTES } from '@/lib/quotes';
import { KitImportButton } from '@/components/ui/KitImportButton';

export const metadata: Metadata = { title: 'Dashboard — ScriptFlow' };

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const screenplays = await listScreenplays(session.user.id);
  const t = await getTranslations('dashboard');
  // Pick a quote based on day of year — deterministic on server
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = INSPIRATIONAL_QUOTES[dayOfYear % INSPIRATIONAL_QUOTES.length];

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-semibold text-txt-primary tracking-tight">
            {t('greeting', { name: session.user.name?.split(' ')[0] || '' })}
          </h1>
          <p className="text-sm text-txt-secondary mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <KitImportButton />
          <Link href="/screenplay/new">
            <Button variant="primary" size="lg">
              <Plus className="w-4 h-4" />
              {t('newScreenplay')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label={t('totalScreenplays')} value={screenplays.length} />
        <StatCard label={t('activeCollaborations')} value={Array.from(new Set(screenplays.flatMap((s: { collaborators?: { userId: string }[] }) => (s.collaborators || []).map((c) => c.userId)))).length} />
        <StatCard label="Film / Series" value={`${screenplays.filter((s: { type: string }) => s.type === 'FILM').length} / ${screenplays.filter((s: { type: string }) => s.type === 'SERIES').length}`} />
      </div>

      {/* Pending Invites */}
      <PendingInvites />

      {/* Screenplays */}
      {screenplays.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-txt-primary mb-2">{t('emptyState.headline')}</h2>
          <p className="text-txt-secondary mb-6">{t('emptyState.cta')}</p>
          <Link href="/screenplay/new">
            <Button variant="primary" size="lg">{t('emptyState.cta')}</Button>
          </Link>
          <div className="mt-10 max-w-md mx-auto">
            <p className="text-sm text-txt-secondary italic leading-relaxed">
              &ldquo;{quote.text['az']}&rdquo;
            </p>
            <p className="text-xs text-txt-muted mt-2">— {quote.author}</p>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-sm font-medium uppercase tracking-wide text-txt-muted mb-4">Recent Scripts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {screenplays.map((sp: { id: string; title: string; type: string; genre: string[]; logline: string | null; lastEditedAt: string | Date; _count: { collaborators: number } }, i: number) => (
              <div key={sp.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in h-full">
                <ScreenplayCard screenplay={sp} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-panel rounded-lg p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">{label}</p>
      <p className="text-2xl font-semibold text-txt-primary font-mono">{value}</p>
    </div>
  );
}
