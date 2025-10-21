import { Clock, Bot, User, Check, Circle } from 'lucide-react';
import type { ChatSession } from '@/types';
import { ChatStatus } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ChatListPanelProps {
  chats?: ChatSession[];
  selectedChatId?: string;
  onSelectChat?: (chat: ChatSession) => void;
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

export function ChatListPanel({ chats = [], selectedChatId, onSelectChat }: ChatListPanelProps) {
  return (
    <div className="w-80 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Conversazioni</h2>
        <p className="text-sm text-muted-foreground">{chats.length} chat attive</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nessuna chat attiva</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat?.(chat)}
                className={cn(
                  "w-full p-3 rounded-lg text-left mb-2 transition-colors",
                  selectedChatId === chat.id
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm">Chat #{chat.id.slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground">
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
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
