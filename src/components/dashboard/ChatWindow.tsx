import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, Archive, Flag, XCircle, Download, StickyNote, Paperclip, History, Ticket } from 'lucide-react';
import type { ChatSession, ChatMessage, Operator, InternalNote, UserHistory } from '@/types';
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
import { UserHistoryDialog } from './UserHistoryDialog';
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
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL'); // Priority
  const [tags, setTags] = useState<string[]>([]); // Tags
  const [newTag, setNewTag] = useState(''); // New tag input
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null); // User History
  const [showUserHistory, setShowUserHistory] = useState(false); // User History dialog
  const [loadingHistory, setLoadingHistory] = useState(false); // Loading state
  const [showConvertModal, setShowConvertModal] = useState(false); // Convert to Ticket modal
  const [convertFormData, setConvertFormData] = useState({
    contactMethod: 'WHATSAPP' as 'WHATSAPP' | 'EMAIL',
    whatsappNumber: '',
    email: '',
    operatorNotes: '',
  }); // Convert form data
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null); // Debounce typing
  const fileInputRef = useRef<HTMLInputElement>(null); // File input ref
  const { operator: currentOperator } = useAuth();
  const { socket } = useSocket();

  // Reset message input and initialize priority/tags when chat changes
  useEffect(() => {
    setMessage('');
    setFlagReason('');
    setUserIsTyping(false);
    if (selectedChat) {
      setPriority(selectedChat.priority || 'NORMAL');

      // Parse tags with error handling
      let parsedTags: string[] = [];
      if (selectedChat.tags && typeof selectedChat.tags === 'string' && selectedChat.tags.trim()) {
        try {
          parsedTags = JSON.parse(selectedChat.tags);
        } catch (error) {
          console.error('Failed to parse tags for session', selectedChat.id, error);
          parsedTags = [];
        }
      }
      setTags(parsedTags);
    }
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

  const loadAvailableOperators = useCallback(async () => {
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
  }, [currentOperator?.id]);

  useEffect(() => {
    if (showTransferDialog) {
      loadAvailableOperators();
    }
  }, [showTransferDialog, loadAvailableOperators]);

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

  // P1.8: Priority & Tags handlers
  const handlePriorityChange = async (newPriority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') => {
    if (!selectedChat) return;
    try {
      await chatApi.updatePriority(selectedChat.id, newPriority);
      setPriority(newPriority);
      console.log('✅ Priority updated:', newPriority);
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Errore durante l\'aggiornamento della priorità');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedChat) return;
    const updatedTags = [...tags, newTag.trim()];
    try {
      await chatApi.updateTags(selectedChat.id, updatedTags);
      setTags(updatedTags);
      setNewTag('');
      console.log('✅ Tag added:', newTag);
    } catch (error) {
      console.error('Error adding tag:', error);
      alert('Errore durante l\'aggiunta del tag');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedChat) return;
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    try {
      await chatApi.updateTags(selectedChat.id, updatedTags);
      setTags(updatedTags);
      console.log('✅ Tag removed:', tagToRemove);
    } catch (error) {
      console.error('Error removing tag:', error);
      alert('Errore durante la rimozione del tag');
    }
  };

  // P0.2: User History handler
  const handleLoadUserHistory = async () => {
    if (!selectedChat?.userId) {
      alert('Nessun utente registrato associato a questa chat');
      return;
    }

    setLoadingHistory(true);
    try {
      const response = await chatApi.getUserHistory(selectedChat.userId);
      setUserHistory(response.data || response);
      setShowUserHistory(true);
      console.log('✅ User history loaded');
    } catch (error) {
      console.error('Error loading user history:', error);
      alert('Errore durante il caricamento dello storico utente');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Convert to Ticket handler
  const handleConvertToTicket = async () => {
    if (!selectedChat) return;

    // Validate contact info
    if (convertFormData.contactMethod === 'WHATSAPP' && !convertFormData.whatsappNumber.trim()) {
      alert('Inserisci un numero WhatsApp');
      return;
    }
    if (convertFormData.contactMethod === 'EMAIL' && !convertFormData.email.trim()) {
      alert('Inserisci un indirizzo email');
      return;
    }

    try {
      await chatApi.convertToTicket(selectedChat.id, convertFormData);
      alert('Chat convertita in ticket con successo!');
      setShowConvertModal(false);
      // Reset form
      setConvertFormData({
        contactMethod: 'WHATSAPP',
        whatsappNumber: '',
        email: '',
        operatorNotes: '',
      });
      onCloseChat?.();
      console.log('✅ Chat converted to ticket');
    } catch (error) {
      console.error('Error converting to ticket:', error);
      alert('Errore durante la conversione in ticket');
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

          {/* Convert to Ticket Button */}
          {selectedChat.status !== 'CLOSED' && selectedChat.status !== 'TICKET_CREATED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConvertModal(true)}
              title="Converti in ticket"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Ticket
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

          {/* User History Button (P0.2) */}
          {selectedChat.userId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadUserHistory}
              disabled={loadingHistory}
              title="Storico utente"
            >
              <History className="h-4 w-4 mr-2" />
              {loadingHistory ? 'Caricamento...' : 'Storico'}
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={onCloseChat}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* P1.8: Priority & Tags Section */}
      <div className="border-b bg-card px-6 py-3 flex items-center gap-4">
        {/* Priority Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priorità:</span>
          <select
            value={priority}
            onChange={(e) => handlePriorityChange(e.target.value as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT')}
            className="px-3 py-1 text-sm border rounded-md bg-background focus:ring-2 focus:ring-ring focus:outline-none"
          >
            <option value="LOW">🟢 Bassa</option>
            <option value="NORMAL">🔵 Normale</option>
            <option value="HIGH">🟠 Alta</option>
            <option value="URGENT">🔴 Urgente</option>
          </select>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <span className="text-sm text-muted-foreground">Tags:</span>
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-primary/80 font-bold"
                title="Rimuovi tag"
              >
                ×
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Aggiungi tag"
              className="w-32 h-7 text-sm"
            />
            <Button
              onClick={handleAddTag}
              size="sm"
              variant="secondary"
              className="h-7"
              disabled={!newTag.trim()}
            >
              +
            </Button>
          </div>
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

      {/* User History Dialog (P0.2) */}
      <UserHistoryDialog
        userHistory={userHistory}
        currentSessionId={selectedChat.id}
        open={showUserHistory}
        onClose={() => setShowUserHistory(false)}
      />

      {/* Convert to Ticket Modal */}
      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Converti Chat in Ticket</DialogTitle>
            <DialogDescription>
              Crea un ticket da questa conversazione per follow-up asincrono
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Contact Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Metodo di Contatto</label>
              <select
                value={convertFormData.contactMethod}
                onChange={(e) =>
                  setConvertFormData({
                    ...convertFormData,
                    contactMethod: e.target.value as 'WHATSAPP' | 'EMAIL',
                  })
                }
                className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>

            {/* WhatsApp Number */}
            {convertFormData.contactMethod === 'WHATSAPP' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Numero WhatsApp</label>
                <Input
                  type="tel"
                  value={convertFormData.whatsappNumber}
                  onChange={(e) =>
                    setConvertFormData({
                      ...convertFormData,
                      whatsappNumber: e.target.value,
                    })
                  }
                  placeholder="+39 123 456 7890"
                />
              </div>
            )}

            {/* Email */}
            {convertFormData.contactMethod === 'EMAIL' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={convertFormData.email}
                  onChange={(e) =>
                    setConvertFormData({
                      ...convertFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="user@example.com"
                />
              </div>
            )}

            {/* Operator Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Note Operatore (opzionale)</label>
              <textarea
                value={convertFormData.operatorNotes}
                onChange={(e) =>
                  setConvertFormData({
                    ...convertFormData,
                    operatorNotes: e.target.value,
                  })
                }
                rows={3}
                placeholder="Aggiungi note per gli altri operatori..."
                className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:outline-none resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertModal(false)}>
              Annulla
            </Button>
            <Button onClick={handleConvertToTicket}>
              Converti in Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
