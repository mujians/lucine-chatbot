import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from '../lib/axios';

const WS_URL = import.meta.env.VITE_WS_URL || 'https://chatbot-lucy-2025.onrender.com';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, WAITING, ACTIVE, WITH_OPERATOR
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState(null);
  // P2.4: Bulk actions state
  const [selectedChats, setSelectedChats] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchChats();

    // Initialize Socket.IO for real-time updates
    const socket = io(WS_URL);

    // Join dashboard room
    socket.emit('join_dashboard');

    // Listen for new chat created
    socket.on('new_chat_created', (data) => {
      console.log('🆕 New chat created:', data);
      fetchChats();
    });

    // Listen for new chat requests
    socket.on('new_chat_request', (data) => {
      console.log('🔔 New chat request:', data);
      fetchChats();
    });

    // Listen for chat assigned
    socket.on('chat_assigned', (data) => {
      console.log('👤 Chat assigned:', data);
      fetchChats();
    });

    // Listen for chat closed
    socket.on('chat_closed', (data) => {
      console.log('✅ Chat closed:', data);
      fetchChats();
    });

    const interval = setInterval(fetchChats, 30000); // Poll every 30s as fallback

    return () => {
      clearInterval(interval);
      socket.emit('leave_dashboard');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    filterChats();
  }, [chats, searchTerm, filter]);

  const fetchChats = async () => {
    try {
      // axios instance already adds Authorization header via interceptor
      const response = await axios.get(`/api/chat/sessions`);

      setChats(response.data.data?.sessions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const filterChats = () => {
    let filtered = chats;

    // Filter by status
    if (filter !== 'ALL') {
      filtered = filtered.filter((chat) => chat.status === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (chat) =>
          chat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.id.includes(searchTerm)
      );
    }

    setFilteredChats(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WITH_OPERATOR':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'WAITING':
        return '⏳';
      case 'ACTIVE':
        return '🤖';
      case 'WITH_OPERATOR':
        return '👤';
      case 'CLOSED':
        return '✅';
      default:
        return '⚪';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff}s fa`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m fa`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h fa`;
    return date.toLocaleDateString('it-IT');
  };

  const handleChatClick = (chat) => {
    setSelectedChatId(chat.id);
    onSelectChat?.(chat);
  };

  // P2.4: Bulk selection handlers
  const toggleChatSelection = (chatId) => {
    const newSelection = new Set(selectedChats);
    if (newSelection.has(chatId)) {
      newSelection.delete(chatId);
    } else {
      newSelection.add(chatId);
    }
    setSelectedChats(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedChats.size === filteredChats.length) {
      setSelectedChats(new Set());
    } else {
      setSelectedChats(new Set(filteredChats.map((c) => c.id)));
    }
  };

  // P2.4: Bulk action handlers
  const handleBulkArchive = async () => {
    if (!confirm(`Archiviare ${selectedChats.size} chat?`)) return;

    setBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedChats).map((chatId) =>
          axios.post(`/api/chat/sessions/${chatId}/archive`)
        )
      );
      fetchChats();
      setSelectedChats(new Set());
    } catch (error) {
      console.error('Bulk archive error:', error);
      alert('Errore durante archiviazione');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkClose = async () => {
    if (!confirm(`Chiudere ${selectedChats.size} chat?`)) return;

    setBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedChats).map((chatId) =>
          axios.post(`/api/chat/session/${chatId}/close`)
        )
      );
      fetchChats();
      setSelectedChats(new Set());
    } catch (error) {
      console.error('Bulk close error:', error);
      alert('Errore durante chiusura');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Eliminare ${selectedChats.size} chat? Questa azione è irreversibile.`)) return;

    setBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedChats).map((chatId) =>
          axios.delete(`/api/chat/sessions/${chatId}`)
        )
      );
      fetchChats();
      setSelectedChats(new Set());
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Errore durante eliminazione');
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* P2.4: Select All Checkbox */}
            {filteredChats.length > 0 && (
              <input
                type="checkbox"
                checked={selectedChats.size === filteredChats.length && filteredChats.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-christmas-green border-gray-300 rounded focus:ring-christmas-green cursor-pointer"
                title="Seleziona tutto"
              />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              Chat Attive
              {selectedChats.size > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  ({selectedChats.size} selezionate)
                </span>
              )}
            </h2>
          </div>
          {/* P13: Total Unread Badge */}
          {(() => {
            const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadMessageCount || 0), 0);
            return totalUnread > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-red-500 text-white text-sm font-bold rounded-full">
                {totalUnread}
              </span>
            ) : null;
          })()}
        </div>

        {/* P2.4: Bulk Actions Toolbar */}
        {selectedChats.size > 0 && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedChats.size} chat selezionate
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkClose}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  Chiudi
                </button>
                <button
                  onClick={handleBulkArchive}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Archivia
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Elimina
                </button>
                <button
                  onClick={() => setSelectedChats(new Set())}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Cerca chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-christmas-green"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'WAITING', 'ACTIVE', 'WITH_OPERATOR'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-christmas-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL'
                ? 'Tutte'
                : status === 'WAITING'
                ? 'In Coda'
                : status === 'ACTIVE'
                ? 'Con AI'
                : 'Con Operatore'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-2xl mb-2">💬</p>
            <p>Nessuna chat {filter !== 'ALL' && filter.toLowerCase()}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-christmas-green' : ''
                }`}
              >
                {/* P2.4: Checkbox for bulk selection */}
                <input
                  type="checkbox"
                  checked={selectedChats.has(chat.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleChatSelection(chat.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 w-4 h-4 text-christmas-green border-gray-300 rounded focus:ring-christmas-green cursor-pointer flex-shrink-0"
                />

                {/* Chat Content - Clickable to open */}
                <button
                  onClick={() => handleChatClick(chat)}
                  className="flex-1 text-left"
                >
                  {/* Chat Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {chat.userName || 'Utente Anonimo'}
                        {chat.operatorId && (
                          <span className="text-xs text-gray-500">
                            con {chat.operator?.name || 'Operatore'}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {chat.id.substring(0, 8)}...
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(chat.lastMessageAt || chat.createdAt)}
                  </span>
                </div>

                {/* Last Message Preview */}
                {chat.messages && Array.isArray(chat.messages) && chat.messages.length > 0 && (
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {chat.messages[chat.messages.length - 1]?.content || 'Nessun messaggio'}
                  </p>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                      chat.status
                    )}`}
                  >
                    {getStatusIcon(chat.status)}
                    {chat.status}
                  </span>

                  {/* P13: Unread Message Badge */}
                  {chat.unreadMessageCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {chat.unreadMessageCount}
                    </span>
                  )}

                  {/* AI Confidence */}
                  {chat.aiConfidence !== null && chat.aiConfidence !== undefined && (
                    <span className="text-xs text-gray-500">
                      AI: {Math.round(chat.aiConfidence * 100)}%
                    </span>
                  )}
                </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-gray-600">Totale</p>
            <p className="font-bold text-lg">{chats.length}</p>
          </div>
          <div>
            <p className="text-gray-600">In Coda</p>
            <p className="font-bold text-lg text-yellow-600">
              {chats.filter((c) => c.status === 'WAITING').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Con Me</p>
            <p className="font-bold text-lg text-green-600">
              {chats.filter((c) => c.status === 'WITH_OPERATOR').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
