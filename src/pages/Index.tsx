import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TopBar } from '@/components/dashboard/TopBar';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';
import { ChatListPanel } from '@/components/dashboard/ChatListPanel';
import { ChatWindow } from '@/components/dashboard/ChatWindow';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatSession } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Index() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);

  const { socket, connected } = useSocket();
  const { operator, logout } = useAuth();
  const navigate = useNavigate();

  // Load initial chats
  useEffect(() => {
    loadChats();
  }, []);

  // Listen to WebSocket events
  useEffect(() => {
    if (!socket) return;

    socket.on('new_chat_request', (data) => {
      console.log('📢 New chat request:', data);
      loadChats();
    });

    socket.on('user_message', (data) => {
      console.log('💬 User message:', data);
      updateChatMessages(data.sessionId, data.message);
    });

    socket.on('chat_closed', (data) => {
      console.log('🔒 Chat closed:', data);
      loadChats();
      if (selectedChat?.id === data.sessionId) {
        setSelectedChat(null);
      }
    });

    socket.on('chat_assigned', (data) => {
      console.log('✅ Chat assigned:', data);
      loadChats();
    });

    socket.on('message_received', (data) => {
      console.log('📨 Message received:', data);
      updateChatMessages(data.sessionId, data.message);
    });

    return () => {
      socket.off('new_chat_request');
      socket.off('user_message');
      socket.off('chat_closed');
      socket.off('chat_assigned');
      socket.off('message_received');
    };
  }, [socket, selectedChat]);

  const loadChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/sessions`);

      // Backend returns { success: true, data: sessions }
      const sessionsData = response.data.data || response.data;

      // Parse messages JSON string and add computed lastMessage
      const parsedChats = sessionsData.map((session: any) => {
        // Parse messages if it's a JSON string
        const messages = typeof session.messages === 'string'
          ? JSON.parse(session.messages)
          : Array.isArray(session.messages)
          ? session.messages
          : [];

        return {
          ...session,
          messages,
          lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
        };
      });

      setChats(parsedChats);
    } catch (error) {
      console.error('❌ Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChatMessages = (sessionId: string, newMessage: any) => {
    setChats(prev => prev.map(chat =>
      chat.id === sessionId
        ? {
            ...chat,
            messages: [...(chat.messages || []), newMessage],
            lastMessage: newMessage,
            lastMessageAt: newMessage.timestamp,
          }
        : chat
    ));

    // Update selected chat if it's the one receiving the message
    if (selectedChat?.id === sessionId) {
      setSelectedChat(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), newMessage],
      } : null);
    }
  };

  const handleSelectChat = (chat: ChatSession) => {
    setSelectedChat(chat);

    // Notify backend that operator joined this chat
    if (socket && operator) {
      socket.emit('join_chat_as_operator', {
        sessionId: chat.id,
        operatorId: operator.id,
      });
    }
  };

  const handleSendMessage = (message: string) => {
    if (!selectedChat || !socket || !operator) return;

    socket.emit('operator_message', {
      sessionId: selectedChat.id,
      message,
      operatorId: operator.id,
    });

    // Optimistically add message to UI
    const newMessage = {
      id: Date.now().toString(),
      type: 'operator' as const,
      content: message,
      timestamp: new Date().toISOString(),
      operatorName: operator.name,
    };

    updateChatMessages(selectedChat.id, newMessage);
  };

  const handleCloseChat = () => {
    if (!selectedChat || !socket || !operator) return;

    socket.emit('close_chat', {
      sessionId: selectedChat.id,
      operatorId: operator.id,
    });

    setSelectedChat(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Caricamento dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar
        operatorName={operator?.name || 'Operatore'}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <OperatorSidebar />
        <ChatListPanel
          chats={chats}
          selectedChatId={selectedChat?.id}
          onSelectChat={handleSelectChat}
        />
        <ChatWindow
          selectedChat={selectedChat}
          onSendMessage={handleSendMessage}
          onCloseChat={handleCloseChat}
        />
      </div>

      {/* WebSocket connection indicator */}
      {!connected && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg">
          ⚠️ WebSocket disconnesso
        </div>
      )}
    </div>
  );
}
