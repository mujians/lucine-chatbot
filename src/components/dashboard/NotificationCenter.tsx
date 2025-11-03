import { useState } from 'react';
import { Bell, MessageSquare, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'new_chat' | 'new_message' | 'chat_assigned' | 'other';
  title: string;
  message: string;
  sessionId?: string;
  userName?: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onClearAll,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_chat':
      case 'chat_assigned':
        return <UserPlus className="h-4 w-4" />;
      case 'new_message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    setOpen(false);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Proprio ora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m fa`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h fa`;
    const days = Math.floor(hours / 24);
    return `${days}g fa`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 px-3">
          <h3 className="font-semibold text-sm">Notifiche</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-auto p-1 text-xs"
            >
              Cancella tutto
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nessuna notifica
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex gap-3 p-3 cursor-pointer",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  notification.type === 'new_chat' && "bg-green-500/10 text-green-500",
                  notification.type === 'new_message' && "bg-blue-500/10 text-blue-500",
                  notification.type === 'chat_assigned' && "bg-purple-500/10 text-purple-500",
                  notification.type === 'other' && "bg-gray-500/10 text-gray-500"
                )}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTimeAgo(notification.timestamp)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
