import { useState } from 'react';
import type { KnowledgeItem } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Edit, Trash2, ToggleLeft, ToggleRight, X, Search, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { knowledgeApi } from '@/lib/api';

interface KnowledgeListProps {
  items: KnowledgeItem[];
  loading: boolean;
  onEdit: (item: KnowledgeItem) => void;
  onUpdate: () => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  isActiveFilter?: boolean;
  onIsActiveFilterChange: (isActive?: boolean) => void;
}

export function KnowledgeList({
  items,
  loading,
  onEdit,
  onUpdate,
  categoryFilter,
  onCategoryFilterChange,
  isActiveFilter,
  onIsActiveFilterChange,
}: KnowledgeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'usage' | 'question'>('date');

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
  const hasActiveFilters = categoryFilter || isActiveFilter !== undefined || searchQuery;

  // Filtro e ordinamento
  const filteredAndSortedItems = items
    .filter((item) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'usage') {
        return (b.timesUsed || 0) - (a.timesUsed || 0);
      } else if (sortBy === 'question') {
        return a.question.localeCompare(b.question);
      } else {
        // date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleToggle = async (item: KnowledgeItem) => {
    try {
      setTogglingId(item.id);
      await knowledgeApi.toggle(item.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle knowledge item:', error);
      alert('Errore durante l\'attivazione/disattivazione del documento');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;

    try {
      setDeletingId(id);
      await knowledgeApi.delete(id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete knowledge item:', error);
      alert('Errore durante l\'eliminazione del documento');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    onCategoryFilterChange('');
    onIsActiveFilterChange(undefined);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca domande, risposte o categorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-4 pb-4 border-b border-border flex-wrap">
        <Select value={categoryFilter || 'all'} onValueChange={(value) => onCategoryFilterChange(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tutte le categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat!}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'true' : 'false'}
          onValueChange={(value: string) =>
            onIsActiveFilterChange(value === 'all' ? undefined : value === 'true')
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tutti gli stati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="true">Solo attivi</SelectItem>
            <SelectItem value="false">Solo inattivi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: 'date' | 'usage' | 'question') => setSortBy(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Ordina per..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Data (più recenti)</SelectItem>
            <SelectItem value="usage">Più utilizzate</SelectItem>
            <SelectItem value="question">Domanda (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Cancella filtri
          </Button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'documento' : 'documenti'}
        </div>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nessun documento trovato"
          description={searchQuery ? "Nessun documento corrisponde alla ricerca." : "Non ci sono documenti nella knowledge base con i filtri selezionati. Crea un nuovo documento per iniziare."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-foreground">{item.question}</h3>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                    <Badge variant={item.isActive ? 'default' : 'secondary'} className="text-xs">
                      {item.isActive ? 'Attivo' : 'Inattivo'}
                    </Badge>
                    {item.timesUsed !== undefined && item.timesUsed > 0 && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {item.timesUsed} {item.timesUsed === 1 ? 'volta' : 'volte'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.answer}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Creato il {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: it })}
                  {item.createdBy && ` da ${item.createdBy.name}`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(item)}
                    disabled={togglingId === item.id}
                  >
                    {item.isActive ? (
                      <ToggleRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 mr-1" />
                    )}
                    {item.isActive ? 'Disattiva' : 'Attiva'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                    Elimina
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
