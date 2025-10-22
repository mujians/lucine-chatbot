import { useState } from 'react';
import type { Ticket } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TicketDetail } from './TicketDetail';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Ticket as TicketIcon, Mail, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { ticketsApi } from '@/lib/api';

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  onUpdate: () => void;
}

export function TicketList({ tickets, loading, onUpdate }: TicketListProps) {
  const { operator } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState<Ticket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAssign = async (ticketId: string) => {
    if (!operator) return;

    try {
      setSubmitting(true);
      await ticketsApi.assign(ticketId, operator.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      alert('Errore durante l\'assegnazione del ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveClick = (ticket: Ticket) => {
    setResolvingTicket(ticket);
    setResolutionNotes('');
    setResolveDialogOpen(true);
  };

  const handleResolveSubmit = async () => {
    if (!resolvingTicket || !resolutionNotes.trim()) return;

    try {
      setSubmitting(true);
      await ticketsApi.resolve(resolvingTicket.id, resolutionNotes);
      setResolveDialogOpen(false);
      setResolvingTicket(null);
      setResolutionNotes('');
      onUpdate();
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      alert('Errore durante la risoluzione del ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailOpen(true);
  };

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
          onClick={() => handleTicketClick(ticket)}
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssign(ticket.id);
                  }}
                  disabled={submitting}
                >
                  Assegna a me
                </Button>
              )}
              {ticket.operatorId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResolveClick(ticket);
                  }}
                  disabled={submitting}
                >
                  Risolvi ticket
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Risolvi Ticket</DialogTitle>
            <DialogDescription>
              Inserisci le note di risoluzione per il ticket di {resolvingTicket?.userName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Descrivi come hai risolto il problema..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialogOpen(false)}
              disabled={submitting}
            >
              Annulla
            </Button>
            <Button
              onClick={handleResolveSubmit}
              disabled={submitting || !resolutionNotes.trim()}
            >
              {submitting ? 'Risolvo...' : 'Risolvi Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TicketDetail
        ticket={selectedTicket}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
