'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Tv2, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { useCreateScreenplay } from '@/lib/api/hooks';
import { cn } from '@/lib/utils/cn';

const GENRES = ['Drama', 'Thriller', 'Comedy', 'Sci-Fi', 'Horror', 'Romance', 'Action', 'Mystery', 'Biography', 'Fantasy', 'Animation', 'Documentary'];
const STEPS = ['Basics', 'Structure', 'Characters'];

export default function NewScreenplayPage() {
  const router = useRouter();
  const createMutation = useCreateScreenplay();
  const [step, setStep] = useState(0);

  // Step 1 state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'FILM' | 'SERIES' | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [logline, setLogline] = useState('');

  // Step 3 state
  const [characters, setCharacters] = useState<Array<{ name: string; roleType: string; isMajor: boolean }>>([]);

  const toggleGenre = (g: string) => {
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 5 ? [...prev, g] : prev);
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: '', roleType: 'SUPPORTING', isMajor: false }]);
  };

  const handleCreate = async () => {
    if (!title || !type || genres.length === 0) return;

    const result = await createMutation.mutateAsync({
      title,
      type,
      genre: genres,
      logline: logline || null,
      characters: characters.filter((c) => c.name.trim()),
    });

    router.push(`/screenplay/${(result as { id: string }).id}/edit`);
  };

  return (
    <div className="max-w-[960px] mx-auto px-6 py-10">
      <ProgressStepper steps={STEPS} currentStep={step} />

      <div className="mt-10">
        {/* Step 1: Basics */}
        {step === 0 && (
          <div className="space-y-8">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Screenplay"
              className="w-full text-2xl font-normal text-txt-primary placeholder:text-txt-muted bg-transparent border-0 outline-none"
            />

            <div>
              <p className="text-sm font-medium text-txt-secondary mb-3">Select type</p>
              <div className="grid grid-cols-2 gap-4">
                {(['FILM', 'SERIES'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      'flex items-center gap-4 p-5 border-2 rounded-xl transition-all',
                      type === t ? 'border-primary bg-[#F8F7FF]' : 'border-border hover:border-txt-muted'
                    )}
                  >
                    {t === 'FILM' ? <Film className="w-8 h-8 text-primary" /> : <Tv2 className="w-8 h-8 text-accent" />}
                    <div className="text-left">
                      <p className="font-semibold text-txt-primary">{t === 'FILM' ? 'Film' : 'TV Series'}</p>
                      <p className="text-xs text-txt-muted">{t === 'FILM' ? 'Feature film screenplay' : 'Multi-episode series'}</p>
                    </div>
                    {type === t && <Check className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-txt-secondary mb-3">Genre</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <Badge key={g} variant="genre" selected={genres.includes(g)} onClick={() => toggleGenre(g)}>
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-txt-secondary mb-1.5">Logline</label>
              <textarea
                value={logline}
                onChange={(e) => setLogline(e.target.value)}
                placeholder="Describe your story in one sentence..."
                maxLength={500}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-surface-card border border-border rounded text-[15px] text-txt-primary placeholder:text-txt-muted resize-y outline-none focus:border-primary focus:border-[1.5px]"
              />
              <p className="text-right text-xs text-txt-muted mt-1">{logline.length}/500</p>
            </div>
          </div>
        )}

        {/* Step 2: Structure (simplified) */}
        {step === 1 && (
          <div className="text-center py-10">
            <h3 className="text-lg font-semibold text-txt-primary mb-2">Structure</h3>
            <p className="text-txt-secondary mb-4">
              A default 3-act structure will be created for you. You can customize it later in the editor.
            </p>
            <div className="flex justify-center gap-4">
              {['Act One', 'Act Two', 'Act Three'].map((act) => (
                <div key={act} className="bg-surface-card border border-border rounded-lg p-4 w-40">
                  <p className="font-mono text-xs uppercase text-txt-muted">{act}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Characters */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-txt-primary">Your Cast</h3>
            {characters.map((char, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface-card border border-border rounded-lg p-3">
                <Input
                  placeholder="Character name"
                  value={char.name}
                  onChange={(e) => {
                    const updated = [...characters];
                    updated[i].name = e.target.value;
                    setCharacters(updated);
                  }}
                  className="flex-1"
                />
                <select
                  value={char.roleType}
                  onChange={(e) => {
                    const updated = [...characters];
                    updated[i].roleType = e.target.value;
                    setCharacters(updated);
                  }}
                  className="h-[42px] px-3 border border-border rounded bg-surface-card text-sm text-txt-primary"
                >
                  <option value="PROTAGONIST">Protagonist</option>
                  <option value="ANTAGONIST">Antagonist</option>
                  <option value="SUPPORTING">Supporting</option>
                  <option value="MINOR">Minor</option>
                </select>
                <Toggle
                  checked={char.isMajor}
                  onChange={(v) => {
                    const updated = [...characters];
                    updated[i].isMajor = v;
                    setCharacters(updated);
                  }}
                  label="Arc"
                />
                <button onClick={() => setCharacters(characters.filter((_, j) => j !== i))} className="text-txt-muted hover:text-danger">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addCharacter} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add another character
            </button>
            <button onClick={() => handleCreate()} className="text-sm text-txt-muted hover:underline block mt-2">
              I&apos;ll add characters later →
            </button>
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : router.back()} disabled={step === 0}>
          Back
        </Button>
        {step < 2 ? (
          <Button variant="primary" onClick={() => setStep(step + 1)} disabled={step === 0 && (!title || !type || genres.length === 0)}>
            Next
          </Button>
        ) : (
          <Button variant="primary" onClick={handleCreate} loading={createMutation.isPending}>
            Create Screenplay
          </Button>
        )}
      </div>
    </div>
  );
}
