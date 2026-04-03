'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MoreVertical, Pencil, BarChart3, Share2, Download, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
type ScreenplayCardProps = {
  id: string;
  title: string;
  type: string;
  genre: string[];
  logline: string | null;
  lastEditedAt: string | Date;
  _count: { collaborators: number };
};

export function ScreenplayCard({ screenplay }: { screenplay: ScreenplayCardProps }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const lastEdited = new Date(screenplay.lastEditedAt);
  const timeAgo = getTimeAgo(lastEdited);

  return (
    <div
      className="relative bg-surface-card border border-border rounded-lg p-5 shadow-1 hover:shadow-2 transition-all duration-200 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
    >
      {/* Type & Genre badges */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant={screenplay.type === 'FILM' ? 'film' : 'series'}>
          {screenplay.type === 'FILM' ? 'Film' : 'TV Series'}
        </Badge>
        {screenplay.genre[0] && (
          <span className="text-xs text-txt-muted">{screenplay.genre[0]}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-txt-primary line-clamp-2 mb-1">
        {screenplay.title}
      </h3>

      {/* Logline */}
      {screenplay.logline && (
        <p className="text-[13px] text-txt-secondary line-clamp-2 mb-3">
          {screenplay.logline}
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4 pt-3">
        <span className="text-[13px] text-txt-muted">{timeAgo}</span>

        {/* Continue writing link on hover */}
        {hovered && (
          <Link
            href={`/screenplay/${screenplay.id}/edit`}
            className="text-sm font-medium text-primary hover:underline transition-opacity"
          >
            Continue Writing →
          </Link>
        )}
      </div>

      {/* Three-dot menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-txt-muted" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 z-50 glass rounded-lg py-1">
              <MenuLink href={`/screenplay/${screenplay.id}/edit`} icon={Pencil}>Edit</MenuLink>
              <MenuLink href={`/screenplay/${screenplay.id}/analytics`} icon={BarChart3}>Analytics</MenuLink>
              <MenuLink href={`/screenplay/${screenplay.id}/share`} icon={Share2}>Share</MenuLink>
              <MenuLink href={`/screenplay/${screenplay.id}/export`} icon={Download}>Export</MenuLink>
              <div className="border-t border-border my-1" />
              <button className="flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-surface-hover w-full transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2 text-sm text-txt-primary hover:bg-surface-hover transition-colors">
      <Icon className="w-4 h-4 text-txt-muted" />
      {children}
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
