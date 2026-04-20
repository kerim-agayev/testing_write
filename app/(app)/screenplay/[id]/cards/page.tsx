'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, ChevronLeft, X, Check } from 'lucide-react';
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

const COLORS = [
  '#6B7280', '#1D7A5A', '#C47A1B', '#B22222', '#1B2A6B',
  '#5C3178', '#1B4F72', '#D35400', '#138D75', '#2C3E50',
];

export default function CardsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addToast = useUIStore((s) => s.addToast);
  const { data: cardsData = [], isLoading } = useCards(id);
  const cards = cardsData as any[];
  const create = useCreateCard(id);
  const update = useUpdateCard(id);
  const del = useDeleteCard(id);
  const reorder = useReorderCards(id);
  const qc = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color: '#1B4F72' });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    create.mutate(form, {
      onSuccess: () => {
        setForm({ title: '', description: '', color: '#1B4F72' });
        setShowAdd(false);
        addToast('Kart əlavə edildi', 'success');
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Xəta baş verdi';
        addToast(`Əlavə uğursuz: ${msg}`, 'error');
      },
    });
  };

  const handleSave = (cardId: string) => {
    update.mutate({ id: cardId, data: form }, {
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
    <div
      className="flex-1 overflow-y-auto p-8 min-h-full"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(180,140,100,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(160,120,80,0.12) 0%, transparent 50%),
          repeating-linear-gradient(
            0deg, transparent, transparent 2px, rgba(139,90,43,0.04) 2px, rgba(139,90,43,0.04) 3px
          ),
          repeating-linear-gradient(
            90deg, transparent, transparent 2px, rgba(139,90,43,0.04) 2px, rgba(139,90,43,0.04) 3px
          ),
          #c4956a
        `,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm transition-colors drop-shadow"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">Cards</h1>
            <p className="text-sm text-white/70 mt-1">{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => { setShowAdd(true); setForm({ title: '', description: '', color: '#1B4F72' }); }} className="flex items-center gap-2">
            <Plus size={16} /> Add Card
          </Button>
        </div>

        {showAdd && (
          <div className="bg-white/95 backdrop-blur border border-white/50 rounded-xl p-4 mb-6 shadow-xl space-y-3 max-w-sm">
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Card title"
              autoFocus
            />
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded bg-surface-base text-txt-primary text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    form.color === c ? 'border-gray-800 scale-125' : 'border-transparent'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={!form.title.trim()}>Save</Button>
              <Button onClick={() => setShowAdd(false)} variant="ghost">Cancel</Button>
            </div>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center py-16 text-white/70 drop-shadow">
            <p className="mb-2 text-lg font-medium">No cards yet</p>
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
                    onEdit={() => {
                      setEditingId(card.id);
                      setForm({ title: card.title, description: card.description || '', color: card.color });
                    }}
                    onDelete={() => handleDelete(card.id)}
                    onSave={() => handleSave(card.id)}
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
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex flex-col bg-[#2a2f3e] rounded-xl shadow-lg overflow-hidden"
      /* Fixed height so all cards are the same size */
    >
      {/* Color accent bar at top */}
      <div className="h-1.5 w-full flex-shrink-0" style={{ background: card.color }} />

      {isEditing ? (
        <div className="flex-1 p-3 flex flex-col gap-2">
          <Input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="text-xs font-bold"
          />
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="flex-1 w-full px-2 py-1.5 border border-border rounded bg-surface-base text-txt-primary text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            style={{ minHeight: '80px' }}
          />
          <div className="flex gap-1 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`w-4 h-4 rounded-full border ${form.color === c ? 'border-white' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-1 py-1 bg-primary text-white rounded text-[11px] hover:bg-primary/90"
            >
              <Check size={11} /> Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-1 py-1 bg-[#3a3f50] text-txt-secondary rounded text-[11px] hover:bg-[#454a5e]"
            >
              <X size={11} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="flex-1 p-3 overflow-y-auto cursor-grab active:cursor-grabbing"
            style={{ minHeight: '160px', maxHeight: '220px' }}
            {...listeners}
            {...attributes}
          >
            <div className="text-[10px] text-white/40 font-mono mb-1.5">#{idx + 1}</div>
            <p className="text-sm font-bold text-white leading-snug mb-2">{card.title}</p>
            {card.description && (
              <p className="text-[11px] text-white/70 leading-relaxed">{card.description}</p>
            )}
          </div>
          {/* Always-visible action buttons */}
          <div className="flex border-t border-white/10 flex-shrink-0">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors text-[11px]"
            >
              <Edit2 size={11} /> Edit
            </button>
            <div className="w-px bg-white/10" />
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors text-[11px]"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
