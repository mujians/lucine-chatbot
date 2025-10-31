import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import Tickets from '@/pages/Tickets';
import TicketDetail from '@/pages/TicketDetail';
import Knowledge from '@/pages/Knowledge';
import Settings from '@/pages/Settings';
import Operators from '@/pages/Operators';
import Profile from '@/pages/Profile';
import Analytics from '@/pages/Analytics';
import CannedResponses from '@/pages/CannedResponses';
import SystemStatus from '@/pages/SystemStatus';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { operator, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!operator) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { operator } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={operator ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Tickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:ticketId"
        element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/knowledge"
        element={
          <ProtectedRoute>
            <Knowledge />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operators"
        element={
          <ProtectedRoute>
            <Operators />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/canned-responses"
        element={
          <ProtectedRoute>
            <CannedResponses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-status"
        element={
          <ProtectedRoute>
            <SystemStatus />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
