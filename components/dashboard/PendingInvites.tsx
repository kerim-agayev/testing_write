'use client';

import { usePendingInvites, useRespondToInvite } from '@/lib/api/hooks';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';

type Invite = {
  screenplayId: string;
  userId: string;
  screenplay: {
    id: string;
    title: string;
    type: string;
    owner: { name: string };
  };
};

export function PendingInvites() {
  const { data, isLoading } = usePendingInvites();
  const respond = useRespondToInvite();
  const t = useTranslations('common');

  const invites = (data || []) as Invite[];

  if (isLoading || invites.length === 0) return null;

  return (
    <div className="mb-8 bg-[var(--surface-card)] border border-[var(--border-color)] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
        Pending Invitations ({invites.length})
      </h3>
      <div className="space-y-3">
        {invites.map((inv) => (
          <div key={inv.screenplayId} className="flex items-center justify-between p-3 rounded border border-[var(--border-color)] bg-[var(--surface-hover)]">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{inv.screenplay.title}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Invited by {inv.screenplay.owner.name} · {inv.screenplay.type}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => respond.mutate({ screenplayId: inv.screenplayId, userId: inv.userId, action: 'accept' })}
                disabled={respond.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                Accept
              </button>
              <button
                onClick={() => respond.mutate({ screenplayId: inv.screenplayId, userId: inv.userId, action: 'reject' })}
                disabled={respond.isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
