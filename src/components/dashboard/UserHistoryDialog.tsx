import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { X, Calendar, Mail, Phone, MessageSquare } from 'lucide-react';
import type { UserHistory, ChatSession } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface UserHistoryDialogProps {
  userHistory: UserHistory | null;
  currentSessionId: string;
  open: boolean;
  onClose: () => void;
}

export function UserHistoryDialog({
  userHistory,
  currentSessionId,
  open,
  onClose,
}: UserHistoryDialogProps) {
  if (!userHistory) return null;

  const getPriorityEmoji = (priority?: string) => {
    switch (priority) {
      case 'URGENT': return '🔴';
      case 'HIGH': return '🟠';
      case 'LOW': return '🟢';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'WITH_OPERATOR':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800';
      case 'TICKET_CREATED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-primary text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              👤 Storico Utente
            </DialogTitle>
            <p className="text-sm opacity-90 mt-1">
              {userHistory.user.name || userHistory.user.email || 'Utente'}
            </p>
          </DialogHeader>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-4 bg-muted/50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium">
                  {userHistory.user.email || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Telefono</p>
                <p className="text-sm font-medium">
                  {userHistory.user.phone || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Totale Chat</p>
                <p className="text-sm font-medium">
                  {userHistory.user.totalChats}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cliente dal</p>
                <p className="text-sm font-medium">
                  {format(new Date(userHistory.user.firstSeenAt), 'dd/MM/yyyy', { locale: it })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sessions List */}
        <ScrollArea className="flex-1 p-6">
          <h4 className="text-sm font-semibold mb-4">
            Conversazioni Precedenti ({userHistory.sessions.length})
          </h4>

          {userHistory.sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessuna conversazione precedente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userHistory.sessions.map((session: ChatSession) => (
                <div
                  key={session.id}
                  className={cn(
                    "border rounded-lg p-4 transition-all",
                    session.id === currentSessionId
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card hover:shadow-md'
                  )}
                >
                  {/* Session Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          getStatusColor(session.status)
                        )}>
                          {session.status}
                        </span>
                        {session.id === currentSessionId && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                            CORRENTE
                          </span>
                        )}
                        {session.priority && session.priority !== 'NORMAL' && (
                          <span className="text-sm">
                            {getPriorityEmoji(session.priority)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.createdAt), "dd MMM yyyy 'alle' HH:mm", { locale: it })}
                        {session.closedAt && (
                          <span className="text-muted-foreground/60">
                            {' → '}
                            {format(new Date(session.closedAt), "dd MMM yyyy 'alle' HH:mm", { locale: it })}
                          </span>
                        )}
                      </p>
                      {session.operator && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Operatore: {session.operator.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Session Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span>
                      💬 {session.messages?.length || 0} messaggi
                    </span>
                    {session.aiConfidence && (
                      <span>
                        🤖 Confidenza AI: {Math.round(session.aiConfidence * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Last Message Preview */}
                  {session.lastMessage && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Ultimo messaggio:</p>
                      <p className="text-sm line-clamp-2">
                        {session.lastMessage.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
