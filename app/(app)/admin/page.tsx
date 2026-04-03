'use client';

import { useState } from 'react';
import { useAdminStats, useAdminUsers, useAdminMentors, useCreateMentor } from '@/lib/api/hooks';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/store/uiStore';
import type { AdminStats } from '@/types/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats');
  const { data: statsData } = useAdminStats();
  const stats = statsData as AdminStats | undefined;
  const [search, setSearch] = useState('');
  const { data: usersData } = useAdminUsers(search);
  const users = (usersData || []) as Array<{ id: string; name: string; email: string; role: string; createdAt: string; _count: { screenplays: number } }>;
  const { data: mentorsData } = useAdminMentors();
  const mentors = (mentorsData || []) as Array<{ id: string; name: string; email: string; _count: { mentorAssignments: number } }>;
  const createMentor = useCreateMentor();
  const addToast = useUIStore((s) => s.addToast);

  const [mentorForm, setMentorForm] = useState({ name: '', email: '', password: '' });
  const [showMentorForm, setShowMentorForm] = useState(false);

  const handleCreateMentor = async () => {
    if (!mentorForm.name || !mentorForm.email || !mentorForm.password) return;
    try {
      await createMentor.mutateAsync(mentorForm);
      addToast('Mentor created successfully', 'success');
      setMentorForm({ name: '', email: '', password: '' });
      setShowMentorForm(false);
    } catch {
      addToast('Failed to create mentor', 'error');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10">
      <h1 className="text-[32px] font-semibold text-txt-primary mb-6">Admin Panel</h1>

      <Tabs
        tabs={[
          { key: 'stats', label: 'Platform Stats' },
          { key: 'mentors', label: 'Mentors' },
          { key: 'users', label: 'Users' },
          { key: 'demo', label: 'Demo Screenplay' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-8"
      />

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Total Screenplays" value={stats.totalScreenplays} />
          <StatCard label="Total Scenes" value={stats.totalScenes} />
          <StatCard label="Active This Week" value={stats.activeThisWeek} />
        </div>
      )}

      {/* Mentors Tab */}
      {activeTab === 'mentors' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-txt-primary">Mentors ({mentors.length})</h2>
            <Button onClick={() => setShowMentorForm(!showMentorForm)}>Add Mentor</Button>
          </div>

          {showMentorForm && (
            <div className="bg-surface-card border border-border rounded-lg p-6 mb-6 max-w-md">
              <h3 className="font-semibold text-txt-primary mb-4">New Mentor</h3>
              <div className="space-y-3">
                <Input label="Name" value={mentorForm.name} onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })} />
                <Input label="Email" type="email" value={mentorForm.email} onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })} />
                <Input label="Password" type="password" value={mentorForm.password} onChange={(e) => setMentorForm({ ...mentorForm, password: e.target.value })} />
                <Button onClick={handleCreateMentor} loading={createMentor.isPending} className="w-full">Create Mentor</Button>
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

      {/* Demo Tab */}
      {activeTab === 'demo' && (
        <div className="bg-surface-card border border-border rounded-lg p-6 max-w-lg">
          <h3 className="font-semibold text-txt-primary mb-2">Global Demo Screenplay</h3>
          <p className="text-sm text-txt-secondary mb-4">
            The demo screenplay is shown to all visitors on the landing page. Only one screenplay can be the demo at a time.
          </p>
          <p className="text-sm text-txt-muted">Current demo management will be available here.</p>
        </div>
      )}
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
