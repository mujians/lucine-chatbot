import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/dashboard/TopBar';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/components/dashboard/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkNotificationAsRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
}

export function DashboardLayout({
  children,
  notifications = [],
  onNotificationClick,
  onMarkNotificationAsRead,
  onClearAllNotifications,
}: DashboardLayoutProps) {
  const { operator, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar
        operatorName={operator?.name || 'Operatore'}
        onLogout={handleLogout}
        notifications={notifications}
        onNotificationClick={onNotificationClick}
        onMarkAsRead={onMarkNotificationAsRead}
        onClearAllNotifications={onClearAllNotifications}
      />
      <div className="flex flex-1 overflow-hidden">
        <OperatorSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
