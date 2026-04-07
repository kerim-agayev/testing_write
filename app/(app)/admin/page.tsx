'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useAdminStats, useAdminUsers, useAdminMentors, useCreateMentor,
  useAdminMentorRequests, useApproveMentorRequest, useRejectMentorRequest,
} from '@/lib/api/hooks';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/store/uiStore';
import { Check, X } from 'lucide-react';
import type { AdminStats } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

export default function AdminPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [activeTab, setActiveTab] = useState('stats');
  const { data: statsData } = useAdminStats();
  const stats = statsData as AdminStats | undefined;
  const [search, setSearch] = useState('');
  const { data: usersData } = useAdminUsers(search);
  const users = (usersData || []) as Array<{ id: string; name: string; email: string; role: string; createdAt: string; _count: { screenplays: number } }>;
  const { data: mentorsData } = useAdminMentors();
  const mentors = (mentorsData || []) as Array<{ id: string; name: string; email: string; _count: { mentorAssignments: number } }>;
  const { data: requestsData } = useAdminMentorRequests('PENDING');
  const pendingRequests = (requestsData || []) as Array<{
    id: string; screenplayId: string; status: string; requestedAt: string;
    mentor: { id: string; name: string; email: string };
    screenplay: { id: string; title: string; type: string; owner: { id: string; name: string; email: string } };
  }>;
  const createMentor = useCreateMentor();
  const approveMentor = useApproveMentorRequest();
  const rejectMentor = useRejectMentorRequest();
  const addToast = useUIStore((s) => s.addToast);

  const [mentorForm, setMentorForm] = useState({ name: '', email: '', password: '' });
  const [showMentorForm, setShowMentorForm] = useState(false);

  const handleCreateMentor = async () => {
    if (!mentorForm.name || !mentorForm.email || !mentorForm.password) return;
    try {
      await createMentor.mutateAsync(mentorForm);
      addToast('Mentor created', 'success');
      setMentorForm({ name: '', email: '', password: '' });
      setShowMentorForm(false);
    } catch {
      addToast('Failed to create mentor', 'error');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMentor.mutateAsync({ id, status: 'ACTIVE' });
      addToast('Mentor request approved', 'success');
    } catch {
      addToast('Failed to approve', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMentor.mutateAsync(id);
      addToast('Mentor request rejected', 'success');
    } catch {
      addToast('Failed to reject', 'error');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
      <h1 className="text-[32px] font-semibold text-txt-primary mb-6">{t('title') || 'Admin Panel'}</h1>

      <Tabs
        tabs={[
          { key: 'stats', label: t('platformStats') || 'Platform Stats' },
          { key: 'mentors', label: t('mentors') || 'Mentors' },
          { key: 'requests', label: `${t('mentorRequests') || 'Mentor Requests'}${pendingRequests.length ? ` (${pendingRequests.length})` : ''}` },
          { key: 'users', label: t('users') || 'Users' },
          { key: 'screenwriters', label: 'Ssenaristlər' },
          { key: 'demo', label: t('demoScreenplay') || 'Demo Screenplay' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-8"
      />

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t('totalUsers') || 'Total Users'} value={stats.totalUsers} />
          <StatCard label={t('totalScreenplays') || 'Total Screenplays'} value={stats.totalScreenplays} />
          <StatCard label={t('totalScenes') || 'Total Scenes'} value={stats.totalScenes} />
          <StatCard label={t('activeThisWeek') || 'Active This Week'} value={stats.activeThisWeek} />
        </div>
      )}

      {/* Mentors Tab */}
      {activeTab === 'mentors' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-txt-primary">Mentors ({mentors.length})</h2>
            <Button onClick={() => setShowMentorForm(!showMentorForm)}>{t('addMentor') || 'Add Mentor'}</Button>
          </div>

          {showMentorForm && (
            <div className="bg-surface-card border border-border rounded-lg p-6 mb-6 max-w-md">
              <h3 className="font-semibold text-txt-primary mb-4">{t('newMentor') || 'New Mentor'}</h3>
              <div className="space-y-3">
                <Input label="Name" value={mentorForm.name} onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })} />
                <Input label="Email" type="email" value={mentorForm.email} onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })} />
                <Input label="Password" type="password" value={mentorForm.password} onChange={(e) => setMentorForm({ ...mentorForm, password: e.target.value })} />
                <Button onClick={handleCreateMentor} loading={createMentor.isPending} className="w-full">{tc('create')}</Button>
              </div>
            </div>
          )}

          <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Mentor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Assignments</th>
                </tr>
              </thead>
              <tbody>
                {mentors.map((m) => (
                  <tr key={m.id} className="border-b border-border hover:bg-surface-hover">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Avatar name={m.name} size={32} />
                      <span className="text-sm font-medium text-txt-primary">{m.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{m.email}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{m._count.mentorAssignments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mentor Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          <h2 className="text-lg font-semibold text-txt-primary mb-6">{t('mentorRequests') || 'Pending Mentor Requests'}</h2>

          {pendingRequests.length === 0 ? (
            <div className="bg-surface-card border border-border rounded-lg p-8 text-center">
              <p className="text-sm text-txt-muted">No pending mentor requests.</p>
            </div>
          ) : (
            <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Screenplay</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Requested Mentor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <tr key={req.id} className="border-b border-border hover:bg-surface-hover">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={req.screenplay.owner.name} size={32} />
                          <span className="text-sm text-txt-primary">{req.screenplay.owner.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-txt-secondary">{req.screenplay.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={req.mentor.name} size={32} />
                          <span className="text-sm text-txt-primary">{req.mentor.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-txt-muted">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="w-8 h-8 flex items-center justify-center rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="w-8 h-8 flex items-center justify-center rounded bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-6" />
          <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Scripts</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-txt-muted">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-surface-hover">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Avatar name={u.name} size={32} />
                      <span className="text-sm font-medium text-txt-primary">{u.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant={u.role === 'ADMIN' ? 'film' : u.role === 'MENTOR' ? 'series' : 'inactive'}>{u.role}</Badge></td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{u._count.screenplays}</td>
                    <td className="px-4 py-3 text-sm text-txt-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screenwriters Tab */}
      {activeTab === 'screenwriters' && <ScreenwritersTab />}

      {/* Demo Tab */}
      {activeTab === 'demo' && (
        <div className="bg-surface-card border border-border rounded-lg p-6 max-w-lg">
          <h3 className="font-semibold text-txt-primary mb-2">{t('demoScreenplay') || 'Global Demo Screenplay'}</h3>
          <p className="text-sm text-txt-secondary mb-4">
            The demo screenplay is shown to all visitors on the landing page. Run the seed script to set up the Harry Potter demo.
          </p>
          <code className="text-xs bg-surface-panel rounded p-2 block text-txt-muted">npm run seed:demo</code>
        </div>
      )}
    </div>
  );
}

type ScreenwriterData = {
  id: string; name: string; email: string;
  screenplayCount: number; screenplayTitles: string[];
  activityLabel: string; activityStatus: 'active' | 'idle' | 'lost';
};

function ScreenwritersTab() {
  const { data: writers = [], isLoading } = useQuery<ScreenwriterData[]>({
    queryKey: ['admin-screenwriters'],
    queryFn: () => fetch('/api/admin/screenwriters').then((r) => r.json()),
  });

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    idle: 'bg-yellow-100 text-yellow-700',
    lost: 'bg-red-100 text-red-700',
  };
  const statusLabels: Record<string, string> = { active: 'Aktiv', idle: 'Passiv', lost: 'İtmiş' };

  if (isLoading) return <div className="text-sm text-txt-muted py-8 text-center">Yüklənir...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-lg font-bold font-mono text-green-700">{writers.filter((w) => w.activityStatus === 'active').length}</p>
          <p className="text-xs text-green-600">Aktiv (7 gün)</p>
        </div>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-lg font-bold font-mono text-yellow-700">{writers.filter((w) => w.activityStatus === 'idle').length}</p>
          <p className="text-xs text-yellow-600">Passiv (7-30 gün)</p>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-lg font-bold font-mono text-red-700">{writers.filter((w) => w.activityStatus === 'lost').length}</p>
          <p className="text-xs text-red-600">İtmiş (30+ gün)</p>
        </div>
      </div>

      <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-panel">
              <th className="text-left px-4 py-3 text-xs font-medium text-txt-muted uppercase tracking-wide">Ssenarist</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-txt-muted uppercase tracking-wide">Email</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-txt-muted uppercase tracking-wide">Ssenarilər</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-txt-muted uppercase tracking-wide">Ssenarilər Adları</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-txt-muted uppercase tracking-wide">Son Aktivlik</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-txt-muted uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {writers.map((w) => (
              <tr key={w.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 font-medium text-txt-primary">{w.name ?? '—'}</td>
                <td className="px-4 py-3 text-txt-secondary text-xs">{w.email}</td>
                <td className="px-4 py-3 text-center font-mono font-bold text-txt-primary">{w.screenplayCount}</td>
                <td className="px-4 py-3 max-w-[200px]">
                  <div className="flex flex-wrap gap-1">
                    {w.screenplayTitles.slice(0, 3).map((title, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 bg-surface-panel border border-border rounded text-txt-secondary">{title}</span>
                    ))}
                    {w.screenplayTitles.length > 3 && <span className="text-xs text-txt-muted">+{w.screenplayTitles.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-txt-secondary">{w.activityLabel}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[w.activityStatus]}`}>
                    {statusLabels[w.activityStatus]}
                  </span>
                </td>
              </tr>
            ))}
            {writers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-txt-muted">Hələ heç bir ssenarist yoxdur.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-txt-muted mb-1">{label}</p>
      <p className="text-3xl font-semibold text-primary font-mono">{value.toLocaleString()}</p>
    </div>
  );
}
