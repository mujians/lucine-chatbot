import { useState, useEffect, useRef } from 'react';
import { Send, X, ArrowRightLeft, Archive, Flag, XCircle } from 'lucide-react';
import type { ChatSession, ChatMessage, Operator } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { chatApi, operatorsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { QuickReplyPicker } from './QuickReplyPicker';

interface ChatWindowProps {
  selectedChat?: ChatSession | null;
  onSendMessage?: (message: string) => void;
  onCloseChat?: () => void;
  onTransferComplete?: () => void;
  onArchiveChat?: (chatId: string) => void;
  onFlagChat?: (chatId: string, reason: string) => void;
  onCloseChatSession?: (chatId: string) => void;
}

export function ChatWindow({
  selectedChat,
  onSendMessage,
  onCloseChat,
  onTransferComplete,
  onArchiveChat,
  onFlagChat,
  onCloseChatSession,
}: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { operator: currentOperator } = useAuth();

  // Reset message input when chat changes
  useEffect(() => {
    setMessage('');
    setFlagReason('');
  }, [selectedChat?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [selectedChat?.messages, selectedChat?.id]);

  useEffect(() => {
    if (showTransferDialog) {
      loadAvailableOperators();
    }
  }, [showTransferDialog]);

  const loadAvailableOperators = async () => {
    try {
      const response = await operatorsApi.getOnline();
      const allOperators = response.data || response;
      // Filter out current operator
      const availableOps = allOperators.filter(
        (op: Operator) => op.id !== currentOperator?.id && op.isAvailable
      );
      setOperators(availableOps);
    } catch (error) {
      console.error('Failed to load operators:', error);
    }
  };

  const handleTransfer = async () => {
    if (!selectedChat || !selectedOperatorId) return;

    try {
      setTransferring(true);
      await chatApi.transferSession(selectedChat.id, {
        toOperatorId: selectedOperatorId,
        reason: transferReason || undefined,
      });

      setShowTransferDialog(false);
      setSelectedOperatorId('');
      setTransferReason('');

      if (onTransferComplete) {
        onTransferComplete();
      }
    } catch (error) {
      console.error('Failed to transfer chat:', error);
      alert('Errore durante il trasferimento della chat');
    } finally {
      setTransferring(false);
    }
  };

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleArchive = async () => {
    if (!selectedChat || !onArchiveChat) return;

    if (!confirm('Vuoi archiviare questa chat?')) return;

    try {
      setActionLoading(true);
      onArchiveChat(selectedChat.id);
    } catch (error) {
      console.error('Failed to archive chat:', error);
      alert('Errore durante l\'archiviazione della chat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = () => {
    setShowFlagDialog(true);
  };

  const handleFlagSubmit = async () => {
    if (!selectedChat || !onFlagChat || !flagReason.trim()) return;

    try {
      setActionLoading(true);
      onFlagChat(selectedChat.id, flagReason);
      setShowFlagDialog(false);
      setFlagReason('');
    } catch (error) {
      console.error('Failed to flag chat:', error);
      alert('Errore durante la segnalazione della chat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseChatSession = async () => {
    if (!selectedChat || !onCloseChatSession) return;

    if (!confirm('Vuoi chiudere definitivamente questa chat? L\'utente non potrà più inviare messaggi.')) return;

    try {
      setActionLoading(true);
      onCloseChatSession(selectedChat.id);
    } catch (error) {
      console.error('Failed to close chat:', error);
      alert('Errore durante la chiusura della chat');
    } finally {
      setActionLoading(false);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Seleziona una chat per iniziare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="h-16 border-b bg-card px-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">
            {selectedChat.userName || `Chat #${selectedChat.id.slice(0, 8)}`}
          </h2>
          <p className="text-xs text-muted-foreground">
            Iniziata {format(new Date(selectedChat.createdAt), "dd MMM 'alle' HH:mm", { locale: it })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedChat.status !== 'CLOSED' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchive}
                disabled={actionLoading || selectedChat.isArchived}
                title={selectedChat.isArchived ? 'Chat già archiviata' : 'Archivia chat'}
              >
                <Archive className="h-4 w-4 mr-2" />
                {selectedChat.isArchived ? 'Archiviata' : 'Archivia'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleFlag}
                disabled={actionLoading || selectedChat.isFlagged}
                title={selectedChat.isFlagged ? 'Chat già segnalata' : 'Segnala chat'}
              >
                <Flag className="h-4 w-4 mr-2" />
                {selectedChat.isFlagged ? 'Segnalata' : 'Segnala'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseChatSession}
                disabled={actionLoading}
                title="Chiudi chat definitivamente"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Chiudi Chat
              </Button>

              {selectedChat.status === 'WITH_OPERATOR' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTransferDialog(true)}
                  disabled={actionLoading}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Trasferisci
                </Button>
              )}
            </>
          )}

          <Button variant="ghost" size="icon" onClick={onCloseChat}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4" ref={scrollAreaRef} key={selectedChat.id}>
          {selectedChat.messages?.map((msg: ChatMessage) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.type === 'operator' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3",
                  msg.type === 'operator'
                    ? 'bg-primary text-primary-foreground'
                    : msg.type === 'ai'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={cn(
                  "text-xs mt-1",
                  msg.type === 'operator' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {format(new Date(msg.timestamp), 'HH:mm', { locale: it })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Scrivi un messaggio o usa /shortcut per risposte rapide..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <QuickReplyPicker onSelect={(content) => setMessage(content)} />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trasferisci Chat</DialogTitle>
            <DialogDescription>
              Seleziona un operatore disponibile a cui trasferire questa chat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Operatore</label>
              <select
                value={selectedOperatorId}
                onChange={(e) => setSelectedOperatorId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Seleziona operatore...</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name} - {op.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo (opzionale)</label>
              <Input
                placeholder="Es: Richiede competenze specifiche..."
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransferDialog(false)}
              disabled={transferring}
            >
              Annulla
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!selectedOperatorId || transferring}
            >
              {transferring ? 'Trasferimento...' : 'Trasferisci'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Segnala Chat</DialogTitle>
            <DialogDescription>
              Indica il motivo per cui vuoi segnalare questa chat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo segnalazione</label>
              <Input
                placeholder="Es: Comportamento inappropriato, spam, etc..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFlagDialog(false);
                setFlagReason('');
              }}
              disabled={actionLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleFlagSubmit}
              disabled={!flagReason.trim() || actionLoading}
              variant="destructive"
            >
              {actionLoading ? 'Segnalazione...' : 'Segnala'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
