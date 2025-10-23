import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Ticket, Settings, BarChart3, MessageCircle, Activity, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: MessageSquare, label: 'Chat', href: '/' },
  { icon: Ticket, label: 'Tickets', href: '/tickets' },
  { icon: Users, label: 'Operatori', href: '/operators' },
  { icon: BarChart3, label: 'Statistiche', href: '/analytics' },
  { icon: MessageCircle, label: 'Risposte Rapide', href: '/canned-responses' },
  { icon: Activity, label: 'System Status', href: '/system-status' },
  { icon: Settings, label: 'Impostazioni', href: '/settings' },
];

export function OperatorSidebar() {
  const location = useLocation();

  return (
    <aside className="w-16 border-r bg-card flex flex-col items-center py-4 gap-4">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
            )}
            title={item.label}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </aside>
  );
}
