import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { KnowledgeList } from '@/components/knowledge/KnowledgeList';
import { KnowledgeForm } from '@/components/knowledge/KnowledgeForm';
import { BulkImportDialog } from '@/components/knowledge/BulkImportDialog';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Upload } from 'lucide-react';
import { useKnowledge } from '@/hooks/useKnowledge';
import { knowledgeApi } from '@/lib/api';
import type { KnowledgeItem } from '@/types';

export default function Knowledge() {
  const [formOpen, setFormOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
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

  const handleBulkImport = () => {
    setBulkImportOpen(true);
  };

  const handleBulkImportClose = () => {
    setBulkImportOpen(false);
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
    <DashboardLayout>
      <div className="p-6 space-y-6">
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
              <Button
                onClick={handleBulkImport}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importa CSV/JSON
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Documento
              </Button>
            </div>
          }
        />

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3">
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

        <KnowledgeForm
          open={formOpen}
          item={editingItem}
          onClose={handleFormClose}
        />

        <BulkImportDialog
          open={bulkImportOpen}
          onClose={handleBulkImportClose}
        />
      </div>
    </DashboardLayout>
  );
}
