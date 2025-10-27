import type { ChatSession } from '@/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Export chat sessions to CSV format
 */
export function exportChatsToCSV(chats: ChatSession[]): void {
  // CSV Header
  const headers = [
    'Chat ID',
    'User Name',
    'Created At',
    'Status',
    'Operator',
    'Message Timestamp',
    'Message Type',
    'Message Content',
    'Is Archived',
    'Is Flagged',
    'Flag Reason',
  ];

  // Build CSV rows
  const rows: string[][] = [];

  chats.forEach((chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      // Chat without messages - still export basic info
      rows.push([
        chat.id,
        chat.userName || 'N/A',
        format(new Date(chat.createdAt), 'dd/MM/yyyy HH:mm', { locale: it }),
        chat.status,
        chat.operator?.name || 'N/A',
        'N/A',
        'N/A',
        'Nessun messaggio',
        chat.isArchived ? 'Sì' : 'No',
        chat.isFlagged ? 'Sì' : 'No',
        chat.flagReason || 'N/A',
      ]);
    } else {
      // Export each message as a row
      chat.messages.forEach((msg) => {
        rows.push([
          chat.id,
          chat.userName || 'N/A',
          format(new Date(chat.createdAt), 'dd/MM/yyyy HH:mm', { locale: it }),
          chat.status,
          chat.operator?.name || 'N/A',
          format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: it }),
          msg.type,
          msg.content.replace(/"/g, '""'), // Escape quotes
          chat.isArchived ? 'Sì' : 'No',
          chat.isFlagged ? 'Sì' : 'No',
          chat.flagReason || 'N/A',
        ]);
      });
    }
  });

  // Convert to CSV string
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Download file
  const filename = `chat_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
  downloadBlob(blob, filename);
}

/**
 * Export chat sessions to JSON format
 */
export function exportChatsToJSON(chats: ChatSession[]): void {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalChats: chats.length,
    chats: chats.map((chat) => ({
      id: chat.id,
      userName: chat.userName,
      userAgent: chat.userAgent,
      ipAddress: chat.ipAddress,
      status: chat.status,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastMessageAt: chat.lastMessageAt,
      closedAt: chat.closedAt,
      isArchived: chat.isArchived,
      archivedAt: chat.archivedAt,
      archivedBy: chat.archivedBy,
      isFlagged: chat.isFlagged,
      flagReason: chat.flagReason,
      flaggedBy: chat.flaggedBy,
      flaggedAt: chat.flaggedAt,
      operator: chat.operator ? {
        id: chat.operator.id,
        name: chat.operator.name,
        email: chat.operator.email,
      } : null,
      operatorJoinedAt: chat.operatorJoinedAt,
      aiConfidence: chat.aiConfidence,
      aiTokensUsed: chat.aiTokensUsed,
      messages: chat.messages?.map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
        operatorName: msg.operatorName,
        confidence: msg.confidence,
        suggestOperator: msg.suggestOperator,
      })) || [],
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });

  const filename = `chat_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
  downloadBlob(blob, filename);
}

/**
 * Helper to download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
