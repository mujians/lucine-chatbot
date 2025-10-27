import { Clock, Bot, User, Check, Circle, MoreVertical, Trash2, Archive, ArchiveRestore, Flag, FlagOff } from 'lucide-react';
import type { ChatSession } from '@/types';
import { ChatStatus } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ChatListPanelProps {
  chats?: ChatSession[];
  selectedChatId?: string;
  selectedChatIds?: Set<string>;
  onSelectChat?: (chat: ChatSession) => void;
  onDeleteChat?: (chat: ChatSession) => void;
  onArchiveChat?: (chat: ChatSession) => void;
  onFlagChat?: (chat: ChatSession) => void;
  onToggleChatSelection?: (chatId: string) => void;
}

const getStatusIcon = (status: ChatStatus) => {
  switch (status) {
    case ChatStatus.WAITING:
      return <Clock className="h-3 w-3" />;
    case ChatStatus.ACTIVE:
      return <Bot className="h-3 w-3" />;
    case ChatStatus.WITH_OPERATOR:
      return <User className="h-3 w-3" />;
    case ChatStatus.CLOSED:
      return <Check className="h-3 w-3" />;
    default:
      return <Circle className="h-3 w-3" />;
  }
};

const getStatusColor = (status: ChatStatus) => {
  switch (status) {
    case ChatStatus.WAITING:
      return 'text-yellow-500';
    case ChatStatus.ACTIVE:
      return 'text-blue-500';
    case ChatStatus.WITH_OPERATOR:
      return 'text-green-500';
    case ChatStatus.CLOSED:
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
};

const getStatusLabel = (status: ChatStatus) => {
  switch (status) {
    case ChatStatus.WAITING:
      return 'In attesa';
    case ChatStatus.ACTIVE:
      return 'Con AI';
    case ChatStatus.WITH_OPERATOR:
      return 'Con operatore';
    case ChatStatus.CLOSED:
      return 'Chiusa';
    default:
      return 'Sconosciuto';
  }
};

export function ChatListPanel({ chats = [], selectedChatId, selectedChatIds, onSelectChat, onDeleteChat, onArchiveChat, onFlagChat, onToggleChatSelection }: ChatListPanelProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {chats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nessuna chat attiva</p>
          </div>
        ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "relative group rounded-lg mb-2 transition-all border-2",
                  selectedChatId === chat.id
                    ? "bg-accent border-primary shadow-md"
                    : "hover:bg-accent/50 border-transparent"
                )}
              >
                {/* Checkbox for bulk selection */}
                {onToggleChatSelection && (
                  <div
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedChatIds?.has(chat.id) || false}
                      onCheckedChange={() => onToggleChatSelection(chat.id)}
                    />
                  </div>
                )}

                <button
                  onClick={() => onSelectChat?.(chat)}
                  className={cn(
                    "w-full p-3 text-left",
                    onToggleChatSelection && "pl-10"
                  )}
                >
                  <div className="flex items-start justify-between mb-1 pr-8">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {chat.userName || `Chat #${chat.id.slice(0, 8)}`}
                      </span>
                      {chat.isArchived && (
                        <Archive className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                      {chat.isFlagged && (
                        <Flag className="h-3 w-3 text-orange-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {format(new Date(chat.createdAt), 'HH:mm', { locale: it })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("flex items-center gap-1", getStatusColor(chat.status))}>
                      {getStatusIcon(chat.status)}
                      <span className="text-xs">{getStatusLabel(chat.status)}</span>
                    </span>
                  </div>

                  {chat.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage.content}
                    </p>
                  )}
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {chat.isArchived ? (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchiveChat?.(chat); }}>
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Ripristina
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchiveChat?.(chat); }}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archivia
                        </DropdownMenuItem>
                      )}

                      {chat.isFlagged ? (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFlagChat?.(chat); }}>
                          <FlagOff className="h-4 w-4 mr-2" />
                          Rimuovi segnalazione
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFlagChat?.(chat); }}>
                          <Flag className="h-4 w-4 mr-2" />
                          Segnala
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onDeleteChat?.(chat); }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
  );
}
