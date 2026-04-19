'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';

export function KitImportButton() {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.kitsp')) {
      addToast('Yalnız .kitsp faylları dəstəklənir', 'error');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import/kitsp', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      addToast(
        `İdxal uğurlu: ${data.scenesImported} səhnə, ${data.charactersImported} personaj, ${data.locationsImported} məkan`,
        'success'
      );
      qc.invalidateQueries({ queryKey: ['screenplays'] });

      setTimeout(() => {
        router.push(`/screenplay/${data.screenplayId}/edit`);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'İdxal uğursuz oldu';
      addToast(`İdxal uğursuz: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".kitsp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 border border-border
                   rounded-lg text-sm text-txt-secondary
                   hover:border-primary hover:text-primary transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload size={14} />
        {loading ? 'İdxal edilir...' : 'KİT Ssenaristdən idxal'}
      </button>
    </>
  );
}
