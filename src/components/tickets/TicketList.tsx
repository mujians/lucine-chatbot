import { useState } from 'react';
import type { Ticket } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Ticket as TicketIcon, Mail, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  onUpdate: () => void;
}

export function TicketList({ tickets, loading }: TicketListProps) {
  const [, setSelectedTicket] = useState<Ticket | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={TicketIcon}
        title="Nessun ticket trovato"
        description="Non ci sono ticket con i filtri selezionati. I ticket vengono creati automaticamente quando un cliente richiede supporto asincrono."
      />
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => setSelectedTicket(ticket)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{ticket.userName}</h3>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(ticket.createdAt), 'dd MMM yyyy HH:mm', { locale: it })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              {ticket.contactMethod === 'WHATSAPP' ? (
                <>
                  <MessageSquare className="h-4 w-4" />
                  <span>{ticket.whatsappNumber}</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>{ticket.email}</span>
                </>
              )}
            </div>

            {ticket.operator && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{ticket.operator.name}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-foreground line-clamp-2">
            {ticket.initialMessage}
          </p>

          {(ticket.status === 'PENDING' || ticket.status === 'OPEN' || ticket.status === 'ASSIGNED') && (
            <div className="mt-3 flex items-center gap-2">
              {!ticket.operatorId && (
                <Button size="sm" variant="outline">
                  Assegna a me
                </Button>
              )}
              {ticket.operatorId && (
                <Button size="sm" variant="outline">
                  Risolvi ticket
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
