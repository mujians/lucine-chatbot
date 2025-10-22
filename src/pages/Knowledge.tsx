import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KnowledgeList } from '@/components/knowledge/KnowledgeList';
import { KnowledgeForm } from '@/components/knowledge/KnowledgeForm';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useKnowledge } from '@/hooks/useKnowledge';
import { knowledgeApi } from '@/lib/api';
import type { KnowledgeItem } from '@/types';

export default function Knowledge() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [category, setCategory] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [regenerating, setRegenerating] = useState(false);

  const { items, loading, error, refetch } = useKnowledge({ category, isActive });

  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
    refetch();
  };

  const handleRegenerateEmbeddings = async () => {
    if (!confirm('Rigenerare gli embeddings per tutti i documenti? Questa operazione potrebbe richiedere alcuni minuti.')) {
      return;
    }

    try {
      setRegenerating(true);
      const response = await knowledgeApi.regenerateEmbeddings();

      alert(
        `Embeddings rigenerati con successo!\n\n` +
        `Processati: ${response.data.processed}/${response.data.total}\n` +
        `${response.data.errors > 0 ? `Errori: ${response.data.errors}` : ''}`
      );
    } catch (error) {
      console.error('Failed to regenerate embeddings:', error);
      alert('Errore durante la rigenerazione degli embeddings');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Knowledge Base"
        description="Gestisci i documenti della knowledge base per l'AI"
        action={
          <div className="flex gap-2">
            <Button
              onClick={handleRegenerateEmbeddings}
              variant="outline"
              disabled={regenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Rigenerando...' : 'Rigenera Embeddings'}
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Documento
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 mb-4">
            Errore durante il caricamento dei documenti: {error.message}
          </div>
        )}

        <KnowledgeList
          items={items}
          loading={loading}
          onEdit={handleEdit}
          onUpdate={refetch}
          categoryFilter={category}
          onCategoryFilterChange={setCategory}
          isActiveFilter={isActive}
          onIsActiveFilterChange={setIsActive}
        />
      </div>

      <KnowledgeForm
        open={formOpen}
        item={editingItem}
        onClose={handleFormClose}
      />
    </div>
  );
}
