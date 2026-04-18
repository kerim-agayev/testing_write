'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/lib/api/hooks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LocationsPage() {
  const { id } = useParams<{ id: string }>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('INT');

  const { data: locations = [], isLoading } = useLocations(id);
  const create = useCreateLocation(id);
  const update = useUpdateLocation(id);
  const del = useDeleteLocation(id);

  const [editForm, setEditForm] = useState<{ name: string; intExt: string; description: string }>({
    name: '', intExt: 'INT', description: '',
  });
  const editingLoc = editingId ? locations.find((l: any) => l.id === editingId) : null;

  useEffect(() => {
    if (editingLoc) {
      setEditForm({ name: editingLoc.name, intExt: editingLoc.intExt, description: editingLoc.description || '' });
    }
  }, [editingId, editingLoc]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    create.mutate({ name: newName, intExt: newType }, {
      onSuccess: () => { setNewName(''); setShowAdd(false); }
    });
  };

  const handleSave = () => {
    if (!editingId || !editForm.name.trim()) return;
    update.mutate({ id: editingId, data: editForm }, {
      onSuccess: () => setEditingId(null)
    });
  };

  if (isLoading) return <div className="p-8 text-txt-muted">Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-surface-base p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-txt-primary">Locations</h1>
            <p className="text-sm text-txt-muted mt-1">{locations.length} location{locations.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Location
          </Button>
        </div>

        {showAdd && (
          <div className="bg-surface-card border border-border rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Location name (e.g., COFFEE SHOP)"
                autoFocus
              />
              <select
                value={newType}
                onChange={e => setNewType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-surface-base text-txt-primary text-sm"
              >
                <option value="INT">INT (Interior)</option>
                <option value="EXT">EXT (Exterior)</option>
                <option value="INT_EXT">INT./EXT. (Both)</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={!newName.trim()}>Save</Button>
                <Button onClick={() => setShowAdd(false)} variant="secondary">Cancel</Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {locations.map((loc: any) => (
            <div
              key={loc.id}
              className="bg-surface-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary transition-colors"
            >
              {editingId === loc.id ? (
                <div className="flex-1 space-y-2">
                  <Input
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-sm"
                  />
                  <select
                    value={editForm.intExt}
                    onChange={e => setEditForm({ ...editForm, intExt: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded bg-surface-base text-txt-primary text-sm"
                  >
                    <option value="INT">INT</option>
                    <option value="EXT">EXT</option>
                    <option value="INT_EXT">INT./EXT.</option>
                  </select>
                  <Input
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    className="text-sm"
                  />
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSave} size="sm">Save</Button>
                    <Button onClick={() => setEditingId(null)} size="sm" variant="secondary">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium text-txt-primary">{loc.name}</div>
                    <div className="text-xs text-txt-muted">{loc.intExt} {loc.description && `• ${loc.description}`}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(loc.id)}
                      className="p-2 hover:bg-surface-panel rounded text-txt-secondary hover:text-txt-primary transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => del.mutate(loc.id)}
                      className="p-2 hover:bg-red-50 rounded text-txt-secondary hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
