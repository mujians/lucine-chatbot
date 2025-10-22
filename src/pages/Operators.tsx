import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { OperatorsList } from '@/components/operators/OperatorsList';
import { OperatorForm } from '@/components/operators/OperatorForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { operatorsApi } from '@/lib/api';
import type { Operator } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function Operators() {
  const { operator: currentOperator } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);

  const isAdmin = currentOperator?.role === 'ADMIN';

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operatorsApi.getAll();
      setOperators(data);
    } catch (err) {
      console.error('Failed to fetch operators:', err);
      setError('Errore durante il caricamento degli operatori');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!isAdmin) {
      alert('Solo gli amministratori possono creare operatori');
      return;
    }
    setEditingOperator(null);
    setFormOpen(true);
  };

  const handleEdit = (operator: Operator) => {
    if (!isAdmin) {
      alert('Solo gli amministratori possono modificare operatori');
      return;
    }
    setEditingOperator(operator);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingOperator(null);
    fetchOperators();
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="Operatori" description="Lista operatori del sistema" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Accesso Negato</h3>
            <p className="text-sm text-muted-foreground">
              Solo gli amministratori possono accedere a questa sezione.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Operatori"
        description="Gestisci gli operatori del sistema"
        action={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Operatore
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <OperatorsList
          operators={operators}
          loading={loading}
          onEdit={handleEdit}
          onUpdate={fetchOperators}
        />
      </div>

      <OperatorForm open={formOpen} operator={editingOperator} onClose={handleFormClose} />
    </div>
  );
}
