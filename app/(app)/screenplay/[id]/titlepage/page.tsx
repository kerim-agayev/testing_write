'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ChevronLeft } from 'lucide-react';
import { useScreenplay, useUpdateTitlePage } from '@/lib/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/store/uiStore';

type ScreenplayWithOwner = {
  title?: string;
  logline?: string | null;
  genre?: string[] | null;
  authorEmail?: string | null;
  authorPhone?: string | null;
  writtenDate?: string | null;
  owner?: { name?: string | null; email?: string | null };
};

export default function TitlePagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: screenplay } = useScreenplay(id) as { data: ScreenplayWithOwner | undefined };
  const updateTitlePage = useUpdateTitlePage(id);
  const addToast = useUIStore((s) => s.addToast);

  const [form, setForm] = useState({
    title: '',
    authorName: '',
    genre: '',
    logline: '',
    authorEmail: '',
    authorPhone: '',
    writtenDate: '',
  });

  useEffect(() => {
    if (screenplay) {
      setForm({
        title: screenplay.title || '',
        authorName: screenplay.owner?.name || '',
        genre: Array.isArray(screenplay.genre) ? screenplay.genre.join(', ') : (screenplay.genre || ''),
        logline: screenplay.logline || '',
        authorEmail: screenplay.authorEmail || '',
        authorPhone: screenplay.authorPhone || '',
        writtenDate: screenplay.writtenDate
          ? new Date(screenplay.writtenDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [screenplay]);

  const handleSave = () => {
    updateTitlePage.mutate(
      {
        authorEmail: form.authorEmail,
        authorPhone: form.authorPhone,
        writtenDate: form.writtenDate || null,
        genre: form.genre.split(',').map((g) => g.trim()).filter(Boolean),
      },
      {
        onSuccess: () => addToast('Yadda saxlandı', 'success'),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Xəta baş verdi';
          addToast(`Saxlama uğursuz: ${msg}`, 'error');
        },
      }
    );
  };

  const formattedDate = form.writtenDate
    ? new Date(form.writtenDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto bg-surface-base">
      <div className="max-w-6xl mx-auto p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-txt-secondary hover:text-txt-primary mb-4 text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-txt-primary">Title Page</h1>
            <p className="text-sm text-txt-muted mt-1">This will be the first page when exported</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateTitlePage.isPending}
            className="flex items-center gap-2"
          >
            <Save size={14} />
            {updateTitlePage.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Screenplay Title</label>
              <Input value={form.title} disabled className="opacity-50" />
              <p className="text-[11px] text-txt-muted mt-1">Set in screenplay settings</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Author Name</label>
              <Input
                value={form.authorName}
                disabled
                className="opacity-50"
              />
              <p className="text-[11px] text-txt-muted mt-1">From your account profile</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Genre</label>
              <Input
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                placeholder="Drama, Comedy"
              />
              <p className="text-[11px] text-txt-muted mt-1">Comma separated if multiple</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Logline</label>
              <textarea
                value={form.logline}
                disabled
                rows={2}
                className="w-full px-3 py-2 border border-border rounded bg-surface-card text-txt-primary text-sm resize-none opacity-50"
              />
              <p className="text-[11px] text-txt-muted mt-1">Set in screenplay settings</p>
            </div>

            <hr className="border-border my-2" />

            <h3 className="text-sm font-medium text-txt-secondary">Contact &amp; Date</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Email</label>
                <Input
                  type="email"
                  value={form.authorEmail}
                  onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Phone</label>
                <Input
                  type="tel"
                  value={form.authorPhone}
                  onChange={(e) => setForm({ ...form, authorPhone: e.target.value })}
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Date</label>
              <Input
                type="date"
                value={form.writtenDate}
                onChange={(e) => setForm({ ...form, writtenDate: e.target.value })}
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <div
              className="bg-white border border-border rounded-lg shadow-sm overflow-hidden"
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
            >
              <div
                className="flex flex-col text-black"
                style={{ padding: '72px 80px', minHeight: '640px' }}
              >
                <div style={{ flex: '1.5' }} />

                {/* Screenplay Title */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <p
                    style={{
                      fontSize: '18pt',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      lineHeight: 1.3,
                      margin: 0,
                    }}
                  >
                    {form.title || 'SCREENPLAY TITLE'}
                  </p>
                </div>

                {/* Author Name */}
                {form.authorName && (
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <p style={{ fontSize: '12pt', margin: 0 }}>{form.authorName}</p>
                  </div>
                )}

                {/* Genre */}
                {form.genre && (
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <p style={{ fontSize: '12pt', textTransform: 'uppercase', margin: 0 }}>{form.genre}</p>
                  </div>
                )}

                {/* Logline */}
                {form.logline && (
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <p style={{ fontSize: '11pt', fontStyle: 'italic', color: '#444', margin: 0 }}>
                      {form.logline}
                    </p>
                  </div>
                )}

                <div style={{ flex: '1' }} />

                {/* Email + Phone */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  {form.authorEmail && (
                    <p style={{ fontSize: '11pt', margin: '0 0 4px 0' }}>{form.authorEmail}</p>
                  )}
                  {form.authorPhone && (
                    <p style={{ fontSize: '11pt', margin: 0 }}>{form.authorPhone}</p>
                  )}
                </div>

                <div style={{ flex: '0.5' }} />

                {/* Date — right aligned */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11pt', color: '#666', margin: 0 }}>{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
