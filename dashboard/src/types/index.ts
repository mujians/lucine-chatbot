export const ChatStatus = {
  WAITING: 'WAITING',
  ACTIVE: 'ACTIVE',
  WITH_OPERATOR: 'WITH_OPERATOR',
  CLOSED: 'CLOSED'
} as const;

export type ChatStatus = typeof ChatStatus[keyof typeof ChatStatus];

export interface ChatMessage {
  id: string;
  chatSessionId: string;
  sender: 'user' | 'ai' | 'operator';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  status: ChatStatus;
  currentOperatorId?: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  lastMessage?: ChatMessage;
  messages?: ChatMessage[];
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  sessionId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
