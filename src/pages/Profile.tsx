import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MessageSquare, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { operatorsApi } from '@/lib/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Profile() {
  const { operator } = useAuth();
  const [isAvailable, setIsAvailable] = useState(operator?.isAvailable || false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync isAvailable with operator from backend
  useEffect(() => {
    if (operator) {
      setIsAvailable(operator.isAvailable || false);
    }
  }, [operator]);

  if (!operator) {
    return null;
  }

  const handleToggleAvailability = async () => {
    try {
      setSaving(true);
      const newState = !isAvailable;
      await operatorsApi.toggleAvailability(newState);
      setIsAvailable(newState);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('Errore durante l\'aggiornamento della disponibilità');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Il Mio Profilo"
          description="Visualizza e modifica il tuo profilo operatore"
        />

        <div className="space-y-6">
        {success && (
          <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-md p-3">
            Modifiche salvate con successo!
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">{operator.name}</h2>
              <p className="text-sm text-muted-foreground">{operator.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={operator.isOnline ? 'default' : 'secondary'}>
                {operator.isOnline ? 'Online' : 'Offline'}
              </Badge>
              <Badge variant={operator.role === 'ADMIN' ? 'destructive' : 'outline'}>
                {operator.role}
              </Badge>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Membro dal {format(new Date(operator.createdAt), 'dd MMMM yyyy', { locale: it })}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Statistiche</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">{operator.totalChatsHandled || 0}</div>
              <div className="text-sm text-muted-foreground">Chat Gestite</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Ticket className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">{operator.totalTicketsHandled || 0}</div>
              <div className="text-sm text-muted-foreground">Ticket Gestiti</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">
                {operator.averageRating ? operator.averageRating.toFixed(1) : '-'}
              </div>
              <div className="text-sm text-muted-foreground">Rating Medio</div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Disponibilità</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Disponibile per nuove chat</p>
              <p className="text-sm text-muted-foreground">
                {isAvailable
                  ? 'Riceverai notifiche per nuove richieste di supporto'
                  : 'Non riceverai nuove assegnazioni'}
              </p>
            </div>
            <Button
              variant={isAvailable ? 'default' : 'outline'}
              onClick={handleToggleAvailability}
              disabled={saving}
            >
              {saving ? 'Aggiorno...' : isAvailable ? 'Disponibile' : 'Non Disponibile'}
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        {operator.whatsappNumber && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Contatti</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">WhatsApp:</span>{' '}
                <span className="text-sm text-muted-foreground">{operator.whatsappNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Last Seen */}
        {operator.lastSeenAt && (
          <div className="text-sm text-muted-foreground">
            Ultimo accesso:{' '}
            {format(new Date(operator.lastSeenAt), 'dd MMMM yyyy HH:mm', { locale: it })}
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
