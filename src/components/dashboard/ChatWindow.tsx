import { useState, useEffect, useRef } from 'react';
import { Send, X, Archive, Flag, XCircle, Download, StickyNote, Paperclip } from 'lucide-react';
import type { ChatSession, ChatMessage, Operator, InternalNote } from '@/types';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { chatApi, operatorsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { QuickReplyPicker } from './QuickReplyPicker';
import { InternalNotesSidebar } from './InternalNotesSidebar';
import { exportChatsToCSV, exportChatsToJSON } from '@/lib/export';

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
  const [showQuickReply, setShowQuickReply] = useState(false);
  const [quickReplySearch, setQuickReplySearch] = useState('');
  const [userIsTyping, setUserIsTyping] = useState(false); // Typing indicator
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]); // Internal Notes
  const [showNotes, setShowNotes] = useState(false); // Notes sidebar toggle
  const [uploadingFile, setUploadingFile] = useState(false); // File upload state
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null); // Debounce typing
  const fileInputRef = useRef<HTMLInputElement>(null); // File input ref
  const { operator: currentOperator } = useAuth();
  const { socket } = useSocket();

  // Reset message input when chat changes
  useEffect(() => {
    setMessage('');
    setFlagReason('');
    setUserIsTyping(false);
  }, [selectedChat?.id]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (!selectedChat) return;

    const markMessagesAsRead = async () => {
      try {
        await chatApi.markAsRead(selectedChat.id);
        console.log('✅ Messages marked as read');
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();
  }, [selectedChat?.id]);

  // Listen for user typing indicator
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleUserTyping = (data: { sessionId: string; isTyping: boolean }) => {
      if (data.sessionId === selectedChat.id) {
        setUserIsTyping(data.isTyping);
      }
    };

    socket.on('user_typing', handleUserTyping);

    // Cleanup
    return () => {
      socket.off('user_typing', handleUserTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, selectedChat]);

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
      setShowQuickReply(false);
      setQuickReplySearch('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);

    // Check if user is typing a shortcut
    if (value.startsWith('/')) {
      setShowQuickReply(true);
      // Extract shortcut query (remove the leading /)
      setQuickReplySearch(value.substring(1));
    } else {
      setShowQuickReply(false);
      setQuickReplySearch('');
    }

    // Emit operator typing indicator
    if (socket && selectedChat) {
      socket.emit('operator_typing', {
        sessionId: selectedChat.id,
        operatorName: currentOperator?.name || 'Operatore',
        isTyping: true,
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('operator_typing', {
          sessionId: selectedChat.id,
          operatorName: currentOperator?.name || 'Operatore',
          isTyping: false,
        });
      }, 1000);
    }
  };

  const handleQuickReplySelect = (content: string) => {
    setMessage(content);
    setShowQuickReply(false);
    setQuickReplySearch('');
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
      alert('Errore durante l\'aggiunta della nota');
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChat) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File troppo grande. Dimensione massima: 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      await chatApi.uploadFile(selectedChat.id, file);
      console.log('✅ File uploaded successfully');
      // Message will be added via WebSocket
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      alert(error.response?.data?.error?.message || 'Errore durante il caricamento del file');
    } finally {
      setUploadingFile(false);
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
    <div className="flex-1 flex bg-background">
      <div className="flex-1 flex flex-col">
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
          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                title="Esporta cronologia chat"
              >
                <Download className="h-4 w-4 mr-2" />
                Esporta
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportChatsToCSV([selectedChat])}>
                Esporta CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportChatsToJSON([selectedChat])}>
                Esporta JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                title={selectedChat.isFlagged ? 'Nota già aggiunta' : 'Aggiungi nota'}
              >
                <Flag className="h-4 w-4 mr-2" />
                {selectedChat.isFlagged ? 'Con Nota' : 'Aggiungi Nota'}
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
            </>
          )}

          {/* Archive button for CLOSED chats */}
          {selectedChat.status === 'CLOSED' && !selectedChat.isArchived && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={actionLoading}
              title="Archivia chat chiusa"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivia
            </Button>
          )}

          {/* Internal Notes Toggle */}
          <Button
            variant={showNotes ? "default" : "outline"}
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            title="Note interne"
          >
            <StickyNote className="h-4 w-4 mr-2" />
            Note ({internalNotes.length})
          </Button>

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

          {/* Typing indicator */}
          {userIsTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  <span className="text-xs text-muted-foreground ml-2">sta scrivendo...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File upload button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="icon"
            variant="outline"
            disabled={uploadingFile}
            title="Carica file"
          >
            <Paperclip className={cn("h-4 w-4", uploadingFile && "animate-pulse")} />
          </Button>

          <Input
            placeholder="Scrivi un messaggio o usa /shortcut per risposte rapide..."
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={uploadingFile}
          />
          <QuickReplyPicker
            onSelect={handleQuickReplySelect}
            open={showQuickReply}
            onOpenChange={setShowQuickReply}
            searchQuery={quickReplySearch}
          />
          <Button onClick={handleSend} size="icon" disabled={uploadingFile}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {uploadingFile && (
          <p className="text-xs text-muted-foreground mt-2">Caricamento file in corso...</p>
        )}
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
            <DialogTitle>Aggiungi Nota</DialogTitle>
            <DialogDescription>
              Aggiungi una nota per tenere questa chat in evidenza.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nota</label>
              <Input
                placeholder="Es: Cliente importante, da richiamare, etc..."
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
              {actionLoading ? 'Salvataggio...' : 'Salva Nota'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      {/* Internal Notes Sidebar */}
      <InternalNotesSidebar
        sessionId={selectedChat.id}
        notes={internalNotes}
        onNotesChange={setInternalNotes}
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
      />
    </div>
  );
}
