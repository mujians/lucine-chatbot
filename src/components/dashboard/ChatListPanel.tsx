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
  onAcceptChat?: (chat: ChatSession) => void;
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

export function ChatListPanel({ chats = [], selectedChatId, selectedChatIds, onSelectChat, onDeleteChat, onArchiveChat, onFlagChat, onAcceptChat, onToggleChatSelection }: ChatListPanelProps) {
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
                  "relative group rounded-lg mb-2 transition-all border-2 border-l-4",
                  selectedChatId === chat.id
                    ? "bg-accent border-primary shadow-md"
                    : "hover:bg-accent/50 border-transparent",
                  // v2.3.4-ux: Border-left color based on status
                  chat.status === 'WAITING' && "border-l-yellow-500",
                  chat.status === 'WITH_OPERATOR' && "border-l-green-500",
                  (chat.unreadMessageCount || 0) > 0 && "border-l-red-500",
                  chat.status === 'ACTIVE' && "border-l-blue-400",
                  chat.status === 'CLOSED' && "border-l-gray-400"
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
                  {/* v2.3.4-ux: HEADER - Nome e Time */}
                  <div className="flex items-start justify-between mb-2 pr-8">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-semibold text-base truncate">
                        {chat.userName || `Visitatore`}
                      </span>
                      {chat.isArchived && (
                        <Archive className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                      {chat.isFlagged && (
                        <Flag className="h-3 w-3 text-orange-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0 ml-2">
                      {(() => {
                        const date = new Date(chat.lastMessageAt || chat.createdAt);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);

                        if (diffMins < 1) return 'ora';
                        if (diffMins < 60) return `${diffMins} min fa`;
                        if (diffHours < 24) return `${diffHours}h fa`;
                        if (diffDays === 1) return 'Ieri';
                        if (diffDays < 7) return `${diffDays}g fa`;
                        return format(date, 'dd/MM', { locale: it });
                      })()}
                    </span>
                  </div>

                  {/* v2.3.4-ux: CONTENT - Last message (2 lines, readable) */}
                  {chat.lastMessage && (
                    <p className="text-sm text-foreground/70 line-clamp-2 mb-2 leading-relaxed">
                      {chat.lastMessage.content}
                    </p>
                  )}

                  {/* v2.3.4-ux: FOOTER - Status + Unread Badge */}
                  <div className="flex items-center justify-between">
                    <span className={cn("flex items-center gap-1 text-xs", getStatusColor(chat.status))}>
                      {getStatusIcon(chat.status)}
                      <span>{getStatusLabel(chat.status)}</span>
                    </span>
                    {(chat.unreadMessageCount || 0) > 0 && (
                      <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 text-sm font-bold text-white bg-red-500 rounded-full">
                        {(chat.unreadMessageCount || 0) > 9 ? '9+' : chat.unreadMessageCount}
                      </span>
                    )}
                  </div>

                  {/* v2.3.4-ux: Accept Button for WAITING chats (more prominent) */}
                  {chat.status === ChatStatus.WAITING && onAcceptChat && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-base font-bold py-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptChat(chat);
                        }}
                      >
                        ✓ Accetta Chat
                        {(() => {
                          const date = new Date(chat.lastMessageAt || chat.createdAt);
                          const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
                          if (diffMins > 0) {
                            return <span className="ml-1 text-xs font-normal">(attesa {diffMins} min)</span>;
                          }
                          return null;
                        })()}
                      </Button>
                    </div>
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
