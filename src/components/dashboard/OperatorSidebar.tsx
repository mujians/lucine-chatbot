import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Ticket, Settings, BarChart3, MessageCircle, Activity, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface OperatorSidebarProps {
  ticketCount?: number;
  chatCount?: number;
}

export function OperatorSidebar({ ticketCount = 0, chatCount = 0 }: OperatorSidebarProps) {
  const location = useLocation();

  const sidebarItems: SidebarItem[] = [
    { icon: MessageSquare, label: 'Chat', href: '/', badge: chatCount },
    { icon: Ticket, label: 'Tickets', href: '/tickets', badge: ticketCount },
    { icon: Users, label: 'Operatori', href: '/operators' },
    { icon: BarChart3, label: 'Statistiche', href: '/analytics' },
    { icon: MessageCircle, label: 'Risposte Rapide', href: '/canned-responses' },
    { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
    { icon: Activity, label: 'System Status', href: '/system-status' },
    { icon: Settings, label: 'Impostazioni', href: '/settings' },
  ];

  return (
    <aside className="w-16 border-r bg-card flex flex-col items-center py-4 gap-4">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        const hasBadge = item.badge && item.badge > 0;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center transition-colors relative",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
            )}
            title={item.label}
          >
            <Icon className="h-5 w-5" />
            {hasBadge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {item.badge! > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </aside>
  );
}
