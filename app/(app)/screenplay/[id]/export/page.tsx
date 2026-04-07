'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, FileText, FileDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function ExportPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'export';

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDownload = (format: 'docx' | 'pdf') => {
    window.open(`/api/screenplays/${id}/export?format=${format}`, '_blank');
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-12 py-10">
      <Link href={`/screenplay/${id}/edit`} className="flex items-center gap-1 text-sm text-txt-secondary hover:text-txt-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Editor
      </Link>

      <h1 className="text-2xl font-semibold text-txt-primary mb-6">Export Your Vision</h1>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        {[
          { key: 'export', label: 'İxrac / Export' },
          { key: 'ruya', label: 'Rüya Rejimi' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
              ${activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-txt-muted hover:text-txt-primary'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-surface-card border border-border rounded-lg p-8 text-center hover:-translate-y-0.5 hover:shadow-2 transition-all duration-200">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-txt-primary mb-2">Word Document</h3>
              <p className="text-sm text-txt-secondary mb-6">
                Export your screenplay as a professionally formatted DOCX file, ready for industry submission.
              </p>
              <Button variant="primary" className="w-full" onClick={() => handleDownload('docx')}>
                <FileDown className="w-4 h-4" /> Download DOCX
              </Button>
            </div>

            <div className="bg-surface-card border border-border rounded-lg p-8 text-center hover:-translate-y-0.5 hover:shadow-2 transition-all duration-200">
              <FileDown className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-txt-primary mb-2">PDF Document</h3>
              <p className="text-sm text-txt-secondary mb-6">
                Export as PDF with proper screenplay formatting, perfect for sharing and archiving.
              </p>
              <Button variant="primary" className="w-full" onClick={() => handleDownload('pdf')}>
                <FileDown className="w-4 h-4" /> Download PDF
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-txt-muted bg-surface-panel rounded-lg p-4">
            Formatted to WGA screenplay standards. Courier Prime 12pt, standard margins (1.5&quot; left, 1&quot; right, 1&quot; top/bottom).
          </p>
        </>
      )}

      {/* Rüya Tab */}
      {activeTab === 'ruya' && (
        <div className="text-center py-20 bg-surface-panel rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✦</span>
          </div>
          <h3 className="text-lg font-semibold text-txt-primary mb-2">Rüya Rejimi</h3>
          <p className="text-sm text-txt-secondary max-w-sm mx-auto">
            Ssenariinizi interaktiv vizual formatda nümayiş etdirin. Bu funksiya tezliklə əlavə ediləcək.
          </p>
          <p className="text-xs text-txt-muted mt-4 italic">Coming soon — Dream Mode</p>
        </div>
      )}
    </div>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="p-10 text-txt-muted">Loading...</div>}>
      <ExportPageContent />
    </Suspense>
  );
}
