'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import {
  DndContext, DragEndEvent, closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCards, useCreateCard, useUpdateCard, useDeleteCard, useReorderCards } from '@/lib/api/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/store/uiStore';

const COLORS = ['#6B7280', '#1D7A5A', '#C47A1B', '#B22222', '#1B2A6B', '#5C3178', '#1B4F72', '#D35400', '#138D75', '#2C3E50'];

export default function CardsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addToast = useUIStore((s) => s.addToast);
  const { data: cards = [], isLoading } = useCards(id);
  const create = useCreateCard(id);
  const update = useUpdateCard(id);
  const del = useDeleteCard(id);
  const reorder = useReorderCards(id);
  const qc = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color: '#6B7280' });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    create.mutate(form, {
      onSuccess: () => {
        setForm({ title: '', description: '', color: '#6B7280' });
        setShowAdd(false);
        addToast('Kart əlavə edildi', 'success');
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Xəta baş verdi';
        addToast(`Əlavə uğursuz: ${msg}`, 'error');
      },
    });
  };

  const handleSave = () => {
    if (!editingId) return;
    update.mutate({ id: editingId, data: form }, {
      onSuccess: () => {
        setEditingId(null);
        addToast('Yadda saxlandı', 'success');
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Xəta baş verdi';
        addToast(`Saxlama uğursuz: ${msg}`, 'error');
      },
    });
  };

  const handleDelete = (cardId: string) => {
    del.mutate(cardId, {
      onSuccess: () => addToast('Kart silindi', 'info'),
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Xəta baş verdi';
        addToast(`Silmə uğursuz: ${msg}`, 'error');
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = (cards as any[]).findIndex(c => c.id === active.id);
    const newIndex = (cards as any[]).findIndex(c => c.id === over.id);
    const newCards = arrayMove(cards, oldIndex, newIndex);

    qc.setQueryData(['cards', id], newCards);
    reorder.mutate(newCards.map((c: any, i: number) => ({ id: c.id, order: i })));
  };

  if (isLoading) return <div className="p-8 text-txt-muted">Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-surface-base p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-txt-secondary hover:text-txt-primary mb-4 text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-txt-primary">Cards</h1>
            <p className="text-sm text-txt-muted mt-1">{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Card
          </Button>
        </div>

        {showAdd && (
          <div className="bg-surface-card border border-border rounded-lg p-4 mb-6 space-y-3">
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Card title"
              autoFocus
            />
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded bg-surface-base text-txt-primary text-sm resize-none"
            />
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    form.color === c ? 'border-txt-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={!form.title.trim()}>Save</Button>
              <Button onClick={() => setShowAdd(false)} variant="secondary">Cancel</Button>
            </div>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center py-16 text-txt-muted">
            <p className="mb-2">No cards yet</p>
            <p className="text-sm">Create cards to plan your screenplay scenes</p>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={(cards as any[]).map(c => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {(cards as any[]).map((card, idx) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    idx={idx}
                    isEditing={editingId === card.id}
                    form={form}
                    setForm={setForm}
                    onEdit={() => { setEditingId(card.id); setForm({ title: card.title, description: card.description || '', color: card.color }); }}
                    onDelete={() => handleDelete(card.id)}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function CardItem({ card, idx, isEditing, form, setForm, onEdit, onDelete, onSave, onCancel }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-surface-card border border-border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: card.color }} />

      {isEditing ? (
        <div className="p-3 space-y-2">
          <Input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="text-xs font-bold"
          />
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-2 py-1 border border-border rounded bg-surface-base text-txt-primary text-[11px] resize-none"
          />
          <div className="flex gap-1 flex-wrap justify-center">
            {['#6B7280', '#1D7A5A', '#C47A1B', '#B22222'].map(c => (
              <button
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`w-4 h-4 rounded-full border ${form.color === c ? 'border-txt-primary' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex gap-1 text-[10px]">
            <button onClick={onSave} className="flex-1 px-2 py-1 bg-primary text-white rounded hover:bg-primary/90">Save</button>
            <button onClick={onCancel} className="flex-1 px-2 py-1 bg-border text-txt-secondary rounded hover:bg-border/70">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-3 pl-4" {...listeners} {...attributes}>
            <div className="text-[10px] text-txt-muted font-mono mb-1">#{idx + 1}</div>
            <p className="text-xs font-bold text-txt-primary line-clamp-2 mb-1">{card.title}</p>
            {card.description && <p className="text-[11px] text-txt-secondary line-clamp-2">{card.description}</p>}
          </div>
          <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 flex gap-1 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1 bg-surface-panel border border-border rounded hover:bg-surface-card text-txt-muted hover:text-txt-primary text-[10px]"
            >
              <Edit2 size={10} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 bg-surface-panel border border-border rounded hover:bg-red-50 text-txt-muted hover:text-red-500 text-[10px]"
            >
              <Trash2 size={10} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
