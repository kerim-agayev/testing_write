'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useScreenplay } from '@/lib/api/hooks';
import { post } from '@/lib/api/client';
import { useUIStore } from '@/store/uiStore';
import type { ScreenplayFull } from '@/types/api';

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useScreenplay(id);
  const screenplay = data as ScreenplayFull | undefined;
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const addToast = useUIStore((s) => s.addToast);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await post(`/screenplays/${id}/collaborators`, { email: inviteEmail });
      addToast('Invitation sent!', 'success');
      setInviteEmail('');
    } catch {
      addToast('Failed to send invitation', 'error');
    }
    setInviting(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
      <Link href={`/screenplay/${id}/edit`} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-txt-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Editor
      </Link>

      <h1 className="text-2xl font-semibold text-txt-primary mb-8">Share & Collaboration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Co-writers */}
        <section className="bg-surface-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">Co-Writers</h2>

          {screenplay?.collaborators.map((collab) => (
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

          {(!screenplay?.collaborators || screenplay.collaborators.length === 0) && (
            <p className="text-sm text-txt-muted mb-4">No co-writers yet.</p>
          )}

          <div className="mt-4 space-y-3">
            <Input
              label="Invite by email"
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button onClick={handleInvite} loading={inviting} className="w-full">
              <Mail className="w-4 h-4" /> Send Invite
            </Button>
          </div>

          <p className="mt-4 text-xs text-txt-muted bg-surface-panel rounded p-3">
            Co-writers can read and edit all scenes in this screenplay.
          </p>
        </section>

        {/* Mentor */}
        <section className="bg-surface-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">Mentor</h2>

          <div className="py-8 text-center">
            <UserCheck className="w-10 h-10 text-txt-muted mx-auto mb-3" />
            <p className="text-sm text-txt-secondary mb-4">Request a mentor to review your screenplay and provide feedback.</p>
            <Button variant="primary">Request a Mentor</Button>
          </div>

          <p className="mt-4 text-xs text-txt-muted bg-surface-panel rounded p-3">
            Mentors can view and annotate your screenplay but cannot edit it.
          </p>
        </section>
      </div>
    </div>
  );
}
