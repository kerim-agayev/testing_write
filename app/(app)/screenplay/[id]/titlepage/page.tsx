'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save } from 'lucide-react';
import { useScreenplay, useUpdateTitlePage } from '@/lib/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function TitlePagePage() {
  const { id } = useParams<{ id: string }>();
  const { data: screenplay } = useScreenplay(id);
  const updateTitlePage = useUpdateTitlePage(id);

  const [form, setForm] = useState({
    title: '',
    logline: '',
    synopsis: '',
    authorEmail: '',
    authorPhone: '',
    writtenDate: '',
  });

  useEffect(() => {
    if (screenplay) {
      setForm({
        title: screenplay.title || '',
        logline: screenplay.logline || '',
        synopsis: screenplay.synopsis || '',
        authorEmail: screenplay.authorEmail || '',
        authorPhone: screenplay.authorPhone || '',
        writtenDate: screenplay.writtenDate
          ? new Date(screenplay.writtenDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [screenplay]);

  const handleSave = () => {
    updateTitlePage.mutate({
      synopsis: form.synopsis,
      authorEmail: form.authorEmail,
      authorPhone: form.authorPhone,
      writtenDate: form.writtenDate,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-surface-base">
      <div className="max-w-6xl mx-auto p-8">
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
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Title</label>
              <Input
                value={form.title}
                disabled
                className="opacity-50"
              />
              <p className="text-[11px] text-txt-muted mt-1">Set in screenplay settings</p>
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

            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Synopsis</label>
              <textarea
                value={form.synopsis}
                onChange={e => setForm({ ...form, synopsis: e.target.value })}
                placeholder="Write the full story summary..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded bg-surface-base text-txt-primary text-sm resize-none focus:border-primary outline-none"
              />
            </div>

            <hr className="border-border my-6" />

            <h3 className="text-sm font-medium text-txt-secondary">Author Information</h3>

            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Email</label>
              <Input
                type="email"
                value={form.authorEmail}
                onChange={e => setForm({ ...form, authorEmail: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Phone</label>
              <Input
                type="tel"
                value={form.authorPhone}
                onChange={e => setForm({ ...form, authorPhone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-txt-muted uppercase mb-1.5">Date</label>
              <Input
                type="date"
                value={form.writtenDate}
                onChange={e => setForm({ ...form, writtenDate: e.target.value })}
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <div
              className="bg-white border border-border rounded-lg p-12 shadow-sm font-mono text-black"
              style={{ fontFamily: "'Courier Prime', 'Courier New', monospace", minHeight: '600px' }}
            >
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-2xl font-bold uppercase tracking-wide mb-4">
                  {form.title || 'SCREENPLAY'}
                </div>

                {form.logline && (
                  <div className="text-sm mb-8 italic max-w-sm">
                    {form.logline}
                  </div>
                )}

                <div className="my-12 w-full border-t border-b border-black py-8">
                  {form.synopsis && (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap max-h-32 overflow-hidden">
                      {form.synopsis}
                    </p>
                  )}
                </div>

                <div className="text-sm mt-auto">
                  {form.authorEmail && <div>{form.authorEmail}</div>}
                  {form.authorPhone && <div>{form.authorPhone}</div>}
                </div>

                {form.writtenDate && (
                  <div className="text-sm text-gray-600 mt-4">
                    {new Date(form.writtenDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
