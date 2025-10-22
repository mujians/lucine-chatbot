import { useState } from 'react';
import type { Operator } from '@/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { operatorsApi } from '@/lib/api';

interface OperatorsListProps {
  operators: Operator[];
  loading: boolean;
  onEdit: (operator: Operator) => void;
  onUpdate: () => void;
}

export function OperatorsList({ operators, loading, onEdit, onUpdate }: OperatorsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo operatore?')) return;

    try {
      setDeletingId(id);
      await operatorsApi.delete(id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete operator:', error);
      alert('Errore durante l\'eliminazione dell\'operatore');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (operators.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nessun operatore trovato"
        description="Non ci sono operatori nel sistema. Crea un nuovo operatore per iniziare."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {operators.map((operator) => (
        <div
          key={operator.id}
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground">{operator.name}</h3>
                <Badge variant={operator.isOnline ? 'default' : 'secondary'} className="text-xs">
                  {operator.isOnline ? 'Online' : 'Offline'}
                </Badge>
                <Badge
                  variant={operator.role === 'ADMIN' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {operator.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{operator.email}</p>
            </div>
          </div>

          {/* Statistics */}
          {(operator.totalChatsHandled !== undefined ||
            operator.totalTicketsHandled !== undefined ||
            operator.averageRating !== undefined) && (
            <div className="grid grid-cols-3 gap-3 mb-3 py-3 border-y border-border">
              <div className="text-center">
                <div className="text-lg font-semibold">{operator.totalChatsHandled || 0}</div>
                <div className="text-xs text-muted-foreground">Chat</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{operator.totalTicketsHandled || 0}</div>
                <div className="text-xs text-muted-foreground">Ticket</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold flex items-center justify-center gap-1">
                  {operator.averageRating ? operator.averageRating.toFixed(1) : '-'}
                  {operator.averageRating && <TrendingUp className="h-3 w-3" />}
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div>Creato il {format(new Date(operator.createdAt), 'dd MMM yyyy', { locale: it })}</div>
            {operator.lastSeenAt && (
              <div>
                Visto{' '}
                {format(new Date(operator.lastSeenAt), 'dd MMM yyyy HH:mm', { locale: it })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(operator)}>
              <Edit className="h-4 w-4 mr-1" />
              Modifica
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(operator.id)}
              disabled={deletingId === operator.id}
            >
              <Trash2 className="h-4 w-4 mr-1 text-destructive" />
              Elimina
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
