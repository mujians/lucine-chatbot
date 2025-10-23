import { Bell, LogOut, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { operatorsApi } from '@/lib/api';
import { useState, useEffect } from 'react';

interface TopBarProps {
  operatorName?: string;
  onLogout?: () => void;
  unreadCount?: number;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function TopBar({ operatorName = 'Operatore', onLogout, unreadCount = 0 }: TopBarProps) {
  const { operator, refreshOperator } = useAuth();
  const [isAvailable, setIsAvailable] = useState(operator?.isAvailable || false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (operator) {
      setIsAvailable(operator.isAvailable || false);
    }
  }, [operator]);

  const handleToggleAvailability = async () => {
    try {
      setToggling(true);
      const newState = !isAvailable;
      await operatorsApi.toggleAvailability(newState);
      setIsAvailable(newState);
      // Refresh operator data from backend to sync AuthContext
      await refreshOperator();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('Errore durante l\'aggiornamento dello stato');
    } finally {
      setToggling(false);
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Lucine Chatbot</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Availability Toggle */}
          <Button
            variant={isAvailable ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleAvailability}
            disabled={toggling}
            className="gap-2"
          >
            {isAvailable ? (
              <>
                <Power className="h-4 w-4" />
                Disponibile
              </>
            ) : (
              <>
                <PowerOff className="h-4 w-4" />
                Non Disponibile
              </>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(operatorName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{operatorName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alert banner quando non disponibile */}
      {!isAvailable && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PowerOff className="h-4 w-4 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Sei NON disponibile per nuove chat. I clienti non potranno essere assegnati a te.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleToggleAvailability}
              disabled={toggling}
              variant="outline"
              className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
            >
              Diventa Disponibile
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
