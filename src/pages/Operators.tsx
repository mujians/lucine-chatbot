import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
      const response = await operatorsApi.getAll();
      console.log('Operators API response:', response);

      // Handle different response formats
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (typeof response === 'object' && response !== null) {
        console.warn('Unexpected operators format:', response);
        data = [];
      }

      setOperators(data);
    } catch (err: any) {
      console.error('Failed to fetch operators:', err);
      console.error('Error response:', err.response);

      if (err.response?.status === 404) {
        setError('Endpoint operatori non trovato sul backend');
      } else if (err.response?.status === 401) {
        setError('Non autorizzato. Effettua il login.');
      } else {
        setError('Errore durante il caricamento degli operatori');
      }
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
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <PageHeader title="Operatori" description="Lista operatori del sistema" />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Accesso Negato</h3>
              <p className="text-sm text-muted-foreground">
                Solo gli amministratori possono accedere a questa sezione.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
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

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3">
            {error}
          </div>
        )}

        <OperatorsList
          operators={operators}
          loading={loading}
          onEdit={handleEdit}
          onUpdate={fetchOperators}
        />

        <OperatorForm open={formOpen} operator={editingOperator} onClose={handleFormClose} />
      </div>
    </DashboardLayout>
  );
}
