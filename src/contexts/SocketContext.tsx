import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { operator } = useAuth();

  useEffect(() => {
    if (!operator) return;

    // Remove /api from URL for WebSocket connection
    const WS_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://chatbot-lucy-2025.onrender.com';

    console.log('🔌 Connecting to WebSocket:', WS_URL);
    const newSocket = io(WS_URL);

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
      // Join dashboard room (all operators)
      newSocket.emit('join_dashboard');
      console.log('📊 Joined dashboard room');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Closing WebSocket connection');
      newSocket.close();
    };
  }, [operator]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
