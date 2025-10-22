import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { TicketList } from '@/components/tickets/TicketList';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { useTickets } from '@/hooks/useTickets';

export default function Tickets() {
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const { tickets, loading, error, refetch } = useTickets(filters);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Tickets"
          description="Gestisci richieste di supporto asincrone (WhatsApp ed Email)"
        />

        <TicketFilters filters={filters} onChange={setFilters} />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
            <p className="font-medium">Errore nel caricamento tickets</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <TicketList tickets={tickets} loading={loading} onUpdate={refetch} />
      </div>
    </DashboardLayout>
  );
}
