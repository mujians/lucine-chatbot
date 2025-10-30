import { useState } from 'react';
import { Trash2, Edit2, Save, X, StickyNote } from 'lucide-react';
import type { InternalNote } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { chatApi } from '@/lib/api';

interface InternalNotesSidebarProps {
  sessionId: string;
  notes: InternalNote[];
  onNotesChange: (notes: InternalNote[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function InternalNotesSidebar({
  sessionId,
  notes,
  onNotesChange,
  isOpen,
  onClose,
}: InternalNotesSidebarProps) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || loading) return;

    try {
      setLoading(true);
      const response = await chatApi.addNote(sessionId, newNoteContent.trim());
      const newNote = response.data?.note || response.note;
      onNotesChange([...notes, newNote]);
      setNewNoteContent('');
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Errore durante l\'aggiunta della nota');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (note: InternalNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editingContent.trim() || loading) return;

    try {
      setLoading(true);
      const response = await chatApi.updateNote(sessionId, noteId, editingContent.trim());
      const updatedNote = response.data?.note || response.note;
      onNotesChange(notes.map((n) => (n.id === noteId ? updatedNote : n)));
      setEditingNoteId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('Errore durante l\'aggiornamento della nota');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa nota?')) return;

    try {
      setLoading(true);
      await chatApi.deleteNote(sessionId, noteId);
      onNotesChange(notes.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Errore durante l\'eliminazione della nota');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l bg-card flex flex-col h-full">
      {/* Header */}
      <div className="h-16 border-b px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Note Interne</h3>
          <span className="text-xs text-muted-foreground">({notes.length})</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {notes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessuna nota interna</p>
            </div>
          )}

          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-background border rounded-lg p-3 space-y-2"
            >
              {editingNoteId === note.id ? (
                <>
                  <Input
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    placeholder="Modifica nota..."
                    disabled={loading}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={!editingContent.trim() || loading}
                      size="sm"
                      className="flex-1"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Salva
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Annulla
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {note.operatorName || 'Operatore'} •{' '}
                      {format(new Date(note.createdAt), "dd MMM 'alle' HH:mm", { locale: it })}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleStartEdit(note)}
                        disabled={loading}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={loading}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add Note Input */}
      <div className="border-t p-4 space-y-2">
        <Input
          placeholder="Aggiungi una nota interna..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddNote();
            }
          }}
          disabled={loading}
        />
        <Button
          onClick={handleAddNote}
          disabled={!newNoteContent.trim() || loading}
          className="w-full"
          size="sm"
        >
          {loading ? 'Salvataggio...' : 'Aggiungi Nota'}
        </Button>
      </div>
    </div>
  );
}
