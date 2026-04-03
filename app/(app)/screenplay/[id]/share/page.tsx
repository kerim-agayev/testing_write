'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, UserCheck, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  useCollaborators, useInviteCollaborator,
  useActiveMentors, useMentorRequest, useRequestMentor, useCancelMentorRequest,
} from '@/lib/api/hooks';
import { useUIStore } from '@/store/uiStore';

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('share');
  const tc = useTranslations('common');
  const { data: collaboratorsData } = useCollaborators(id);
  const collaborators = (collaboratorsData || []) as Array<{
    userId: string; role: string; acceptedAt: string | null;
    user: { id: string; name: string; email: string };
  }>;
  const inviteCollaborator = useInviteCollaborator(id);
  const { data: mentorsData } = useActiveMentors();
  const activeMentors = (mentorsData || []) as Array<{
    id: string; name: string; email: string;
    _count: { mentorAssignments: number };
  }>;
  const { data: mentorRequestData } = useMentorRequest(id);
  const mentorRequest = mentorRequestData as {
    id: string; status: string; mentor: { id: string; name: string; email: string };
  } | null;
  const requestMentor = useRequestMentor(id);
  const cancelRequest = useCancelMentorRequest(id);
  const addToast = useUIStore((s) => s.addToast);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteError(null);
    try {
      await inviteCollaborator.mutateAsync({ email: inviteEmail });
      addToast(t('inviteSent') || 'Invitation sent!', 'success');
      setInviteEmail('');
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || 'Failed to send invitation';
      setInviteError(msg);
    }
  };

  const handleRequestMentor = async (mentorId: string) => {
    try {
      await requestMentor.mutateAsync({ mentorId });
      addToast('Mentor request sent!', 'success');
    } catch {
      addToast('Failed to send request', 'error');
    }
  };

  const handleCancelRequest = async () => {
    try {
      await cancelRequest.mutateAsync();
      addToast('Request cancelled', 'success');
    } catch {
      addToast('Failed to cancel', 'error');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
      <Link href={`/screenplay/${id}/edit`} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-txt-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> {tc('back')}
      </Link>

      <h1 className="text-2xl font-semibold text-txt-primary mb-8">{t('title') || 'Share & Collaboration'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Co-writers */}
        <section className="bg-surface-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">{t('coWriters') || 'Co-Writers'}</h2>

          {collaborators.map((collab) => (
            <div key={collab.userId} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <Avatar name={collab.user.name} size={40} />
              <div className="flex-1">
                <p className="text-sm font-medium text-txt-primary">{collab.user.name}</p>
                <p className="text-xs text-txt-muted">{collab.user.email}</p>
              </div>
              <Badge variant={collab.acceptedAt ? 'active' : 'pending'}>
                {collab.acceptedAt ? 'Active' : 'Pending'}
              </Badge>
            </div>
          ))}

          {collaborators.length === 0 && (
            <p className="text-sm text-txt-muted mb-4">No co-writers yet.</p>
          )}

          <div className="mt-4 space-y-3">
            <Input
              label={t('inviteByEmail') || 'Invite by email'}
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setInviteError(null); }}
            />
            {inviteError && (
              <p className="text-xs text-[var(--color-danger)]">{inviteError}</p>
            )}
            <Button onClick={handleInvite} loading={inviteCollaborator.isPending} className="w-full">
              <Mail className="w-4 h-4" /> {t('sendInvite') || 'Send Invite'}
            </Button>
          </div>
        </section>

        {/* Mentor */}
        <section className="bg-surface-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">{t('mentor') || 'Mentor'}</h2>

          {/* Active mentor */}
          {mentorRequest?.status === 'ACTIVE' && (
            <div className="p-4 bg-[var(--color-accent)]/10 rounded-lg border border-[var(--color-accent)]/20 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={mentorRequest.mentor.name} size={32} />
                <div>
                  <p className="text-sm font-medium text-txt-primary">{mentorRequest.mentor.name}</p>
                  <p className="text-xs text-txt-muted">{mentorRequest.mentor.email}</p>
                </div>
              </div>
              <Badge variant="active">Active Mentor</Badge>
            </div>
          )}

          {/* Pending request */}
          {mentorRequest?.status === 'PENDING' && (
            <div className="p-4 bg-[var(--color-warning)]/10 rounded-lg border border-[var(--color-warning)]/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[var(--color-warning)]" />
                <p className="text-sm font-medium text-[var(--color-warning)]">
                  Request pending for {mentorRequest.mentor.name}
                </p>
              </div>
              <p className="text-xs text-txt-muted mb-2">Waiting for admin approval</p>
              <button
                onClick={handleCancelRequest}
                className="text-xs text-[var(--color-danger)] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Cancel request
              </button>
            </div>
          )}

          {/* Mentor list — only show when no active request */}
          {!mentorRequest && (
            <>
              <p className="text-sm text-txt-secondary mb-4">
                {t('requestMentorDesc') || 'Request a mentor to review your screenplay and provide feedback.'}
              </p>

              {activeMentors.length === 0 ? (
                <p className="text-sm text-txt-muted py-4">No mentors available at this time.</p>
              ) : (
                <div className="space-y-3">
                  {activeMentors.map((mentor) => (
                    <div key={mentor.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                      <Avatar name={mentor.name} size={32} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-txt-primary">{mentor.name}</p>
                        <p className="text-xs text-txt-muted">{mentor._count.mentorAssignments} active reviews</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRequestMentor(mentor.id)}
                        loading={requestMentor.isPending}
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Request
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <p className="mt-4 text-xs text-txt-muted bg-surface-panel rounded p-3">
            Mentors can view and annotate your screenplay but cannot edit it.
          </p>
        </section>
      </div>
    </div>
  );
}
