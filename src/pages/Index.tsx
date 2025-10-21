import { useState } from 'react';
import { TopBar } from '@/components/dashboard/TopBar';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';
import { ChatListPanel } from '@/components/dashboard/ChatListPanel';
import { ChatWindow } from '@/components/dashboard/ChatWindow';
import type { ChatSession } from '@/types';

export default function Index() {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  const handleSelectChat = (chat: ChatSession) => {
    setSelectedChat(chat);
  };

  const handleChatClosed = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar operatorName="Operatore" onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <OperatorSidebar />
        <ChatListPanel
          chats={[]}
          selectedChatId={selectedChat?.id}
          onSelectChat={handleSelectChat}
        />
        <ChatWindow
          selectedChat={selectedChat}
          onSendMessage={handleSendMessage}
          onCloseChat={handleChatClosed}
        />
      </div>
    </div>
  );
}
