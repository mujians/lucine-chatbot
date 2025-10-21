import { MessageSquare, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { icon: <MessageSquare className="h-5 w-5" />, label: 'Chat', active: true },
  { icon: <BarChart3 className="h-5 w-5" />, label: 'Statistiche' },
  { icon: <Settings className="h-5 w-5" />, label: 'Impostazioni' },
];

export function OperatorSidebar() {
  return (
    <aside className="w-16 border-r bg-card flex flex-col items-center py-4 gap-4">
      {sidebarItems.map((item, index) => (
        <button
          key={index}
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
            item.active
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
          )}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </aside>
  );
}
