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
  isArchived: boolean;
  archivedAt?: string;
  archivedBy?: string;
  isFlagged: boolean;
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;
  deletedAt?: string;
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
  role: 'OPERATOR' | 'ADMIN';
  isOnline: boolean;       // Connected to dashboard
  isAvailable: boolean;    // Available to receive new chats
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

// ============================================
// TICKETS
// ============================================

export const TicketStatus = {
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];

export const ContactMethod = {
  WHATSAPP: 'WHATSAPP',
  EMAIL: 'EMAIL',
} as const;

export type ContactMethod = typeof ContactMethod[keyof typeof ContactMethod];

export interface Ticket {
  id: string;
  userName: string;
  contactMethod: ContactMethod;
  whatsappNumber?: string;
  email?: string;
  initialMessage: string;
  status: TicketStatus;
  priority: TicketPriority;
  operatorId?: string;
  operator?: {
    id: string;
    name: string;
    email: string;
  };
  assignedAt?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resumeToken: string;
  resumeTokenExpiresAt: string;
  sessionId: string;
  session?: ChatSession;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// KNOWLEDGE BASE
// ============================================

export interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  isActive: boolean;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SETTINGS
// ============================================

export interface Setting {
  id: string;
  key: string;
  value: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
