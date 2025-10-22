import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { cannedResponsesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { CannedResponse } from '@/types';

export default function CannedResponses() {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<CannedResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    shortcut: '',
    isGlobal: false,
  });
  const [saving, setSaving] = useState(false);
  const { operator } = useAuth();

  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    filterResponses();
  }, [responses, searchQuery]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const response = await cannedResponsesApi.getAll();
      setResponses(response.data || response);
    } catch (error) {
      console.error('Failed to load canned responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    let filtered = responses;

    if (searchQuery) {
      filtered = filtered.filter(
        (resp) =>
          resp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resp.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resp.shortcut?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResponses(filtered);
  };

  const handleOpenDialog = (response?: CannedResponse) => {
    if (response) {
      setEditingResponse(response);
      setFormData({
        title: response.title,
        content: response.content,
        shortcut: response.shortcut || '',
        isGlobal: response.isGlobal,
      });
    } else {
      setEditingResponse(null);
      setFormData({
        title: '',
        content: '',
        shortcut: '',
        isGlobal: false,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingResponse(null);
    setFormData({
      title: '',
      content: '',
      shortcut: '',
      isGlobal: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingResponse) {
        await cannedResponsesApi.update(editingResponse.id, formData);
      } else {
        await cannedResponsesApi.create(formData);
      }

      loadResponses();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save canned response:', error);
      alert('Errore nel salvataggio della risposta rapida');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa risposta rapida?')) return;

    try {
      await cannedResponsesApi.delete(id);
      loadResponses();
    } catch (error) {
      console.error('Failed to delete canned response:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  const handleToggleActive = async (response: CannedResponse) => {
    try {
      await cannedResponsesApi.update(response.id, {
        isActive: !response.isActive,
      });
      loadResponses();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const stats = {
    total: responses.length,
    active: responses.filter((r) => r.isActive).length,
    global: responses.filter((r) => r.isGlobal).length,
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Caricamento risposte rapide...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Risposte Rapide"
        description="Gestisci le risposte predefinite per velocizzare il supporto"
        action={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuova Risposta
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Totali</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Attive</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Globali</p>
            <p className="text-2xl font-bold text-blue-600">{stats.global}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca risposte per titolo, contenuto o shortcut..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Responses List */}
        {filteredResponses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nessuna risposta rapida trovata</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredResponses.map((response) => (
              <div
                key={response.id}
                className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{response.title}</h3>
                      {response.isGlobal && (
                        <Badge variant="default">Globale</Badge>
                      )}
                      {!response.isActive && (
                        <Badge variant="secondary">Disattivata</Badge>
                      )}
                      {response.shortcut && (
                        <Badge variant="outline">/{response.shortcut}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {response.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Usata {response.timesUsed} volte</span>
                      {response.creator && (
                        <span>Creata da {response.creator.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(response)}
                      title={response.isActive ? 'Disattiva' : 'Attiva'}
                    >
                      {response.isActive ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(response)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(response.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingResponse ? 'Modifica Risposta Rapida' : 'Nuova Risposta Rapida'}
            </DialogTitle>
            <DialogDescription>
              Crea risposte predefinite per velocizzare il supporto ai clienti.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titolo *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Es: Orari di apertura"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contenuto *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Le Lucine di Natale sono aperte..."
                required
                rows={6}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Shortcut (opzionale)</label>
              <Input
                value={formData.shortcut}
                onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                placeholder="orari"
              />
              <p className="text-xs text-muted-foreground">
                Gli operatori possono usare /shortcut per inserire velocemente questa risposta
              </p>
            </div>

            {operator?.role === 'ADMIN' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isGlobal"
                  checked={formData.isGlobal}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isGlobal" className="text-sm font-medium">
                  Risposta globale (visibile a tutti gli operatori)
                </label>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={saving}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvataggio...' : editingResponse ? 'Salva Modifiche' : 'Crea'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
