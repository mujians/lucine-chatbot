import { useState } from 'react';
import type { Ticket, TicketPriority } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, User, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ticketsApi } from '@/lib/api';

interface TicketDetailProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function TicketDetail({ ticket, open, onOpenChange, onUpdate }: TicketDetailProps) {
  const [updating, setUpdating] = useState(false);

  if (!ticket) return null;

  const messages = ticket.session?.messages || [];

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket || newPriority === ticket.priority) return;

    try {
      setUpdating(true);
      await ticketsApi.update(ticket.id, { priority: newPriority });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update ticket priority:', error);
      alert('Errore durante l\'aggiornamento della priorità');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Ticket #{ticket.id.slice(0, 8)}</DialogTitle>
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </DialogHeader>

        {/* Priority Change (only if not resolved/closed) */}
        {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
          <div className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Priorità:
              </label>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                disabled={updating}
                className="px-3 py-1 border rounded-md text-sm bg-background"
              >
                <option value="LOW">Bassa</option>
                <option value="NORMAL">Normale</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
              {updating && <span className="text-xs text-muted-foreground">Aggiornamento...</span>}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* User Info */}
          <div className="border-b border-border pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Cliente</div>
                <div className="font-medium">{ticket.userName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Contatto</div>
                <div className="flex items-center gap-2">
                  {ticket.contactMethod === 'WHATSAPP' ? (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{ticket.whatsappNumber}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{ticket.email}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Creato</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(ticket.createdAt), 'dd MMM yyyy HH:mm', { locale: it })}
                </div>
              </div>
              {ticket.operator && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Operatore</div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    {ticket.operator.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Initial Message */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Messaggio Iniziale</div>
            <div className="bg-muted p-3 rounded-md text-sm">
              {ticket.initialMessage}
            </div>
          </div>

          {/* Conversation */}
          {messages.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-3">Conversazione</div>
              <div className="space-y-3 max-h-96 overflow-y-auto border border-border rounded-md p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-muted text-foreground'
                          : message.type === 'operator'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {message.type === 'user'
                            ? 'Cliente'
                            : message.type === 'operator'
                            ? message.operatorName || 'Operatore'
                            : 'AI'}
                        </Badge>
                        <span className="text-xs opacity-70">
                          {format(new Date(message.timestamp), 'HH:mm', { locale: it })}
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      {message.confidence && (
                        <div className="text-xs opacity-70 mt-1">
                          Confidenza: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Info */}
          {ticket.status === 'RESOLVED' && ticket.resolutionNotes && (
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="font-medium">Risolto</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded-md">
                <div className="text-sm text-muted-foreground mb-1">
                  {ticket.resolvedAt &&
                    format(new Date(ticket.resolvedAt), 'dd MMM yyyy HH:mm', { locale: it })}
                </div>
                <div className="text-sm">{ticket.resolutionNotes}</div>
              </div>
            </div>
          )}

          {/* Resume Token */}
          {ticket.resumeToken && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <div className="border-t border-border pt-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Token di Ripresa</div>
              <div className="bg-muted p-3 rounded-md">
                <code className="text-xs">{ticket.resumeToken}</code>
                <div className="text-xs text-muted-foreground mt-1">
                  Scade:{' '}
                  {format(new Date(ticket.resumeTokenExpiresAt), 'dd MMM yyyy HH:mm', {
                    locale: it,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
