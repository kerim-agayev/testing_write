'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserIcon, ChevronDownIcon } from 'lucide-react';

interface Collaborator {
  userId: string;
  user: { id: string; name: string; avatarUrl?: string | null };
}

interface OwnerInfo {
  userId: string;
  name: string;
  avatarUrl?: string | null;
}

interface Props {
  sceneId: string;
  screenplayId: string;
  collaborators: Collaborator[];
  currentOwner?: OwnerInfo | null;
}

export function SceneOwnerDropdown({ sceneId, screenplayId, collaborators, currentOwner }: Props) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const assign = useMutation({
    mutationFn: (userId: string) =>
      fetch(`/api/scenes/${sceneId}/owner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).then((r) => r.json()),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ['scene-owners', screenplayId] });
      const prev = qc.getQueryData(['scene-owners', screenplayId]);
      qc.setQueryData(['scene-owners', screenplayId], (old: Record<string, OwnerInfo> = {}) => ({
        ...old,
        [sceneId]: {
          userId,
          name: collaborators.find((c) => c.userId === userId)?.user.name ?? '',
          avatarUrl: collaborators.find((c) => c.userId === userId)?.user.avatarUrl ?? null,
          updatedAt: new Date().toISOString(),
        },
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(['scene-owners', screenplayId], ctx?.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['scene-owners', screenplayId] });
      setOpen(false);
    },
  });

  const remove = () => {
    fetch(`/api/scenes/${sceneId}/owner`, { method: 'DELETE' });
    qc.setQueryData(['scene-owners', screenplayId], (old: Record<string, OwnerInfo> = {}) => {
      const next = { ...old };
      delete next[sceneId];
      return next;
    });
    setOpen(false);
  };

  return (
    <div className="relative mt-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs w-full
                   bg-surface-panel border border-border hover:border-primary transition-colors"
      >
        {currentOwner ? (
          <>
            <Avatar name={currentOwner.name} avatarUrl={currentOwner.avatarUrl} size={14} />
            <span className="truncate text-txt-primary font-medium flex-1 text-left">
              {currentOwner.name}
            </span>
          </>
        ) : (
          <>
            <UserIcon size={12} className="text-txt-muted" />
            <span className="text-txt-muted flex-1 text-left">Son toxunan...</span>
          </>
        )}
        <ChevronDownIcon size={10} className="text-txt-muted flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 min-w-[160px]
                          bg-surface-card border border-border rounded-lg shadow-xl overflow-hidden">
            {currentOwner && (
              <button
                onClick={remove}
                className="w-full text-left px-3 py-2 text-xs text-txt-muted
                           hover:bg-surface-panel transition-colors border-b border-border"
              >
                Seçimi sil
              </button>
            )}
            {collaborators.map((c) => (
              <button
                key={c.userId}
                onClick={() => assign.mutate(c.userId)}
                disabled={assign.isPending}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors
                            hover:bg-surface-panel
                            ${currentOwner?.userId === c.userId
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-txt-primary'}`}
              >
                <Avatar name={c.user.name} avatarUrl={c.user.avatarUrl} size={16} />
                <span className="truncate">{c.user.name}</span>
                {currentOwner?.userId === c.userId && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Avatar({ name, avatarUrl, size }: { name: string; avatarUrl?: string | null; size: number }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" style={{ width: size, height: size }} className="rounded-full flex-shrink-0" />;
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      className="rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary"
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}
