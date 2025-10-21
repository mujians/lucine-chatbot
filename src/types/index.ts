export const ChatStatus = {
  WAITING: 'WAITING',
  ACTIVE: 'ACTIVE',
  WITH_OPERATOR: 'WITH_OPERATOR',
  CLOSED: 'CLOSED',
  TICKET_CREATED: 'TICKET_CREATED',  // Backend has this
} as const;

export type ChatStatus = typeof ChatStatus[keyof typeof ChatStatus];

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'operator' | 'system';  // Backend uses 'type', not 'sender'
  content: string;
  timestamp: string;  // Backend sends ISO string
  operatorName?: string;
  confidence?: number;
  suggestOperator?: boolean;
}

export interface ChatSession {
  id: string;
  userName: string | null;  // Backend has userName, not userId
  userAgent?: string;
  ipAddress?: string;
  status: ChatStatus;
  messages: ChatMessage[];  // Will be parsed from JSON string
  operatorId?: string;  // Backend has operatorId, not currentOperatorId
  operator?: {
    id: string;
    name: string;
    email: string;
  };
  aiConfidence?: number;
  aiTokensUsed?: number;
  operatorJoinedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  closedAt?: string;
  lastMessage?: ChatMessage;  // Computed field for UI
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  role: 'OPERATOR' | 'ADMIN';  // Backend has role
  isOnline: boolean;  // Backend has isOnline, not isAvailable
  whatsappNumber?: string;
  notificationPreferences?: any;
  totalChatsHandled?: number;
  totalTicketsHandled?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  lastSeenAt?: string;
}

export interface User {
  id: string;
  sessionId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
