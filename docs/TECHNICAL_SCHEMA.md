# LUCINE CHATBOT - SCHEMA TECNICO E FUNZIONI

**Data Creazione:** 2025-10-21
**Ultima Modifica:** 2025-10-21
**Backend URL:** https://chatbot-lucy-2025.onrender.com
**Dashboard URL:** (in costruzione)

---

## INDICE

1. [DATABASE SCHEMA](#database-schema)
2. [API ENDPOINTS](#api-endpoints)
3. [WEBSOCKET EVENTS](#websocket-events)
4. [TYPESCRIPT TYPES](#typescript-types)
5. [ENVIRONMENT VARIABLES](#environment-variables)
6. [SECURITY & AUTH](#security--auth)
7. [ERROR HANDLING](#error-handling)
8. [ESEMPI RICHIESTE](#esempi-richieste)

---

## DATABASE SCHEMA

### Tabelle Prisma

#### Operator
```prisma
model Operator {
  id                      String   @id @default(uuid())
  email                   String   @unique
  passwordHash            String
  name                    String
  role                    OperatorRole @default(OPERATOR) // OPERATOR | ADMIN

  // Availability
  isOnline                Boolean  @default(false)
  lastSeenAt              DateTime @default(now())

  // Notification settings
  whatsappNumber          String?
  notificationPreferences Json?

  // Stats
  totalChatsHandled       Int      @default(0)
  totalTicketsHandled     Int      @default(0)
  averageRating           Float?

  // Timestamps
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  // Relations
  chatSessions            ChatSession[]
  tickets                 Ticket[]
  knowledgeItems          KnowledgeItem[]
}
```

**Fields Spiegazione:**
- `isOnline`: Settato via WebSocket connect/disconnect + manual toggle
- `notificationPreferences`: JSON con preferenze (email, whatsapp, inApp, audio, quietHours)
- `totalChatsHandled`: Incrementato quando chiude chat
- `averageRating`: Media rating cliente (future)

---

#### ChatSession
```prisma
model ChatSession {
  id                      String   @id @default(uuid())

  // User info
  userName                String?
  userAgent               String?
  ipAddress               String?  // Hashed per GDPR

  // Session state
  status                  ChatStatus @default(ACTIVE)
  // ACTIVE | WAITING | WITH_OPERATOR | CLOSED | TICKET_CREATED
  messages                Json     @default("[]")

  // AI stats
  aiConfidence            Float?   // 0.0-1.0 (ultimo AI response)
  aiTokensUsed            Int      @default(0)

  // Operator assignment
  operatorId              String?
  operator                Operator? @relation(fields: [operatorId], references: [id])
  operatorJoinedAt        DateTime?

  // Timestamps
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  lastMessageAt           DateTime @default(now())
  closedAt                DateTime?

  // Relations
  ticket                  Ticket?
}
```

**Fields Spiegazione:**
- `messages`: Array JSON di messaggi `[{id, sender, content, timestamp, confidence}]`
- `status`: Flow ACTIVE (AI) → WAITING (queue) → WITH_OPERATOR → CLOSED
- `aiConfidence`: Se < 0.7 → richiede operatore
- `lastMessageAt`: Usato per timeout monitoring (>10 min → ticket)

**Status Flow:**
```
ACTIVE (AI chatting)
   ↓ (AI confidence < 70% OR user requests)
WAITING (operator queue)
   ↓ (operator takes chat)
WITH_OPERATOR (human chatting)
   ↓ (operator closes OR timeout)
CLOSED
   ↓ (se timeout)
TICKET_CREATED
```

---

#### Ticket
```prisma
model Ticket {
  id                      String   @id @default(uuid())

  // User contact (dual-channel)
  userName                String
  contactMethod           ContactMethod // WHATSAPP | EMAIL
  whatsappNumber          String?
  email                   String?

  // Ticket content
  initialMessage          String

  // Status & priority
  status                  TicketStatus @default(PENDING)
  // PENDING | ASSIGNED | OPEN | RESOLVED
  priority                TicketPriority @default(NORMAL)
  // LOW | NORMAL | HIGH

  // Assignment
  operatorId              String?
  operator                Operator? @relation(fields: [operatorId], references: [id])
  assignedAt              DateTime?

  // Resolution
  resolutionNotes         String?
  resolvedAt              DateTime?

  // Resume token (per link WhatsApp/Email)
  resumeToken             String   @unique @default(uuid())
  resumeTokenExpiresAt    DateTime // 30 days

  // Linked chat session
  sessionId               String   @unique
  session                 ChatSession @relation(fields: [sessionId], references: [id])

  // Timestamps
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

**Fields Spiegazione:**
- `contactMethod`: WHATSAPP → usa `whatsappNumber`, EMAIL → usa `email`
- `resumeToken`: UUID per link "Riprendi conversazione" (expires 30d)
- `sessionId`: Ticket sempre legato a ChatSession (conversazione originale)
- `status`: PENDING (nuovo) → ASSIGNED (assegnato) → OPEN (in lavorazione) → RESOLVED (chiuso)

---

#### KnowledgeItem
```prisma
model KnowledgeItem {
  id                      String   @id @default(uuid())

  // Content
  question                String   @db.Text
  answer                  String   @db.Text
  category                KnowledgeCategory @default(ALTRO)
  // PARCHEGGIO | BIGLIETTI | ORARI | ACCESSO | SERVIZI | ALTRO

  // Vector embedding (RAG)
  embedding               Unsupported("vector(1536)")? // pgvector

  // Status
  isActive                Boolean  @default(true)

  // Stats
  timesUsed               Int      @default(0)
  lastUsedAt              DateTime?

  // Metadata
  createdBy               String
  creator                 Operator @relation(fields: [createdBy], references: [id])

  // Timestamps
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

**Fields Spiegazione:**
- `embedding`: Vector 1536 dimensioni (OpenAI text-embedding-3-small)
- `timesUsed`: Incrementato ogni volta che AI usa questo documento
- `isActive`: Solo documenti attivi usati da AI

**RAG Flow:**
1. User fa domanda
2. Generate embedding domanda (OpenAI)
3. Vector search top 5 documenti simili: `SELECT * FROM KnowledgeItem ORDER BY embedding <=> $1 LIMIT 5`
4. Passa documenti + domanda a GPT-4
5. GPT-4 genera risposta + confidence
6. Incrementa `timesUsed` dei documenti usati

---

#### Notification
```prisma
model Notification {
  id                      String   @id @default(uuid())

  // Recipient
  recipientId             String?  // null = broadcast

  // Content
  type                    String   // NEW_CHAT, NEW_TICKET, TICKET_RESUMED, etc.
  title                   String
  message                 String

  // Metadata
  metadata                Json?    // {sessionId, ticketId, ...}

  // Status
  isRead                  Boolean  @default(false)
  readAt                  DateTime?

  // Channels sent
  sentViaEmail            Boolean  @default(false)
  sentViaWhatsApp         Boolean  @default(false)
  sentViaInApp            Boolean  @default(true)

  // Timestamps
  createdAt               DateTime @default(now())
}
```

**Notification Types:**
- `NEW_CHAT` - Nuova chat in coda
- `NEW_TICKET` - Nuovo ticket creato
- `TICKET_RESUMED` - Cliente risponde a ticket
- `CHAT_ASSIGNED` - Chat assegnata a operatore
- `CHAT_TIMEOUT` - Chat timeout (>10 min inattività)

---

#### SystemSettings
```prisma
model SystemSettings {
  id                      String   @id @default(uuid())
  key                     String   @unique
  value                   Json
  description             String?
  category                String?  // AI, WHATSAPP, EMAIL, CHAT, WIDGET

  // Audit
  updatedBy               String?  // operatorId
  updatedAt               DateTime @updatedAt
}
```

**Example Settings:**
```json
{
  "key": "ai.confidenceThreshold",
  "value": 0.7,
  "category": "AI",
  "description": "AI confidence threshold per handoff operatore"
}

{
  "key": "chat.timeoutMinutes",
  "value": 10,
  "category": "CHAT",
  "description": "Minuti inattività prima di timeout chat"
}

{
  "key": "twilio.whatsappNumber",
  "value": "whatsapp:+14155238886",
  "category": "WHATSAPP",
  "description": "Numero WhatsApp Business Twilio"
}
```

---

## API ENDPOINTS

### Base URL
```
Production: https://chatbot-lucy-2025.onrender.com
Local Dev:  http://localhost:3000
```

### Authentication
Tutti gli endpoint (tranne `/api/auth/login`) richiedono header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 1. AUTH ROUTES (`/api/auth`)

#### `POST /api/auth/login`
**Request:**
```json
{
  "email": "admin@lucine.it",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "operator": {
      "id": "uuid",
      "email": "admin@lucine.it",
      "name": "Admin User",
      "role": "ADMIN",
      "isOnline": false
    }
  }
}
```

**Errors:**
- `400` - Email/password missing
- `401` - Invalid credentials
- `500` - Server error

---

### 2. CHAT ROUTES (`/api/chat`)

#### `GET /api/chat/sessions`
Lista chat sessions (filtrabili)

**Query Params:**
- `status` (optional): `ACTIVE | WAITING | WITH_OPERATOR | CLOSED`
- `operatorId` (optional): Filter by operator
- `limit` (optional): Default 50
- `offset` (optional): Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "userName": "Mario Rossi",
        "status": "WAITING",
        "aiConfidence": 0.45,
        "operatorId": null,
        "messages": [...],
        "createdAt": "2025-10-21T10:00:00Z",
        "lastMessageAt": "2025-10-21T10:05:00Z"
      }
    ],
    "total": 15,
    "hasMore": false
  }
}
```

---

#### `GET /api/chat/sessions/:sessionId`
Dettaglio singola chat session

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userName": "Mario Rossi",
    "status": "WITH_OPERATOR",
    "operatorId": "uuid",
    "operator": {
      "id": "uuid",
      "name": "Operatore 1"
    },
    "messages": [
      {
        "id": "msg1",
        "sender": "USER",
        "content": "Ciao, vorrei info sui biglietti",
        "timestamp": "2025-10-21T10:00:00Z"
      },
      {
        "id": "msg2",
        "sender": "AI",
        "content": "Certo! I biglietti per le Lucine...",
        "timestamp": "2025-10-21T10:00:05Z",
        "confidence": 0.85
      },
      {
        "id": "msg3",
        "sender": "OPERATOR",
        "content": "Posso aiutarti ulteriormente?",
        "timestamp": "2025-10-21T10:02:00Z"
      }
    ],
    "createdAt": "2025-10-21T10:00:00Z",
    "lastMessageAt": "2025-10-21T10:02:00Z"
  }
}
```

---

#### `POST /api/chat/sessions/:sessionId/messages`
Invia messaggio (operatore → cliente)

**Request:**
```json
{
  "content": "Ciao! Come posso aiutarti?"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_uuid",
      "sender": "OPERATOR",
      "content": "Ciao! Come posso aiutarti?",
      "timestamp": "2025-10-21T10:05:00Z"
    }
  }
}
```

**Side Effects:**
- Aggiorna `messages` array in ChatSession
- Aggiorna `lastMessageAt`
- Emette WebSocket `new_message` a tutti i client connessi
- Invia messaggio al cliente via widget (WebSocket)

---

#### `POST /api/chat/sessions/:sessionId/assign`
Assegna chat a operatore (self-assign)

**Request:**
```json
{
  "operatorId": "uuid"  // optional, default = current operator
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "status": "WITH_OPERATOR",
      "operatorId": "uuid",
      "operatorJoinedAt": "2025-10-21T10:05:00Z"
    }
  }
}
```

**Side Effects:**
- Cambia `status` da `WAITING` → `WITH_OPERATOR`
- Setta `operatorId` e `operatorJoinedAt`
- Emette WebSocket `chat_assigned` a operatori
- Invia notifica al cliente "Operatore X si è unito"

---

#### `POST /api/chat/sessions/:sessionId/close`
Chiudi chat session

**Request:**
```json
{
  "notes": "Cliente soddisfatto, problema risolto"  // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "status": "CLOSED",
      "closedAt": "2025-10-21T10:15:00Z"
    }
  }
}
```

**Side Effects:**
- Cambia `status` → `CLOSED`
- Setta `closedAt`
- Incrementa `operator.totalChatsHandled`
- Emette WebSocket `chat_closed`
- Invia messaggio chiusura al cliente

---

#### `POST /api/chat/sessions/:sessionId/request-operator`
Cliente richiede operatore (da widget)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "status": "WAITING"
    }
  }
}
```

**Side Effects:**
- Cambia `status` → `WAITING`
- Emette WebSocket `new_chat_request` a operatori online
- Crea notifica per operatori

---

### 3. TICKET ROUTES (`/api/tickets`)

#### `GET /api/tickets`
Lista tickets

**Query Params:**
- `status`: `PENDING | ASSIGNED | OPEN | RESOLVED`
- `priority`: `LOW | NORMAL | HIGH`
- `operatorId`: Filter by operator
- `contactMethod`: `WHATSAPP | EMAIL`
- `limit`, `offset`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "uuid",
        "userName": "Mario Rossi",
        "contactMethod": "WHATSAPP",
        "whatsappNumber": "+39123456789",
        "status": "PENDING",
        "priority": "NORMAL",
        "initialMessage": "Non ho ricevuto risposta...",
        "sessionId": "uuid",
        "operatorId": null,
        "createdAt": "2025-10-21T10:00:00Z"
      }
    ],
    "total": 10
  }
}
```

---

#### `GET /api/tickets/:ticketId`
Dettaglio ticket

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userName": "Mario Rossi",
    "contactMethod": "WHATSAPP",
    "whatsappNumber": "+39123456789",
    "email": null,
    "status": "OPEN",
    "priority": "NORMAL",
    "initialMessage": "Non ho ricevuto risposta sulla disponibilità parcheggio",
    "operatorId": "uuid",
    "operator": {
      "name": "Operatore 1"
    },
    "assignedAt": "2025-10-21T10:10:00Z",
    "resumeToken": "token_uuid",
    "resumeTokenExpiresAt": "2025-11-20T10:00:00Z",
    "session": {
      "id": "uuid",
      "messages": [...]
    },
    "createdAt": "2025-10-21T10:00:00Z",
    "resolutionNotes": null,
    "resolvedAt": null
  }
}
```

---

#### `POST /api/tickets`
Crea ticket manuale (operatore crea da dashboard)

**Request:**
```json
{
  "sessionId": "uuid",  // optional, se null crea nuova sessione
  "userName": "Mario Rossi",
  "contactMethod": "WHATSAPP",
  "whatsappNumber": "+39123456789",
  "email": null,
  "initialMessage": "Cliente richiede informazioni su...",
  "priority": "HIGH"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "uuid",
      "resumeToken": "token_uuid",
      ...
    }
  }
}
```

**Side Effects:**
- Crea Ticket in DB
- Invia WhatsApp/Email con link riprendi conversazione
- Crea notifica per operatori

---

#### `PATCH /api/tickets/:ticketId`
Aggiorna ticket (status, priority, notes, assign)

**Request:**
```json
{
  "status": "ASSIGNED",
  "operatorId": "uuid",
  "priority": "HIGH"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticket": {...}
  }
}
```

---

#### `POST /api/tickets/:ticketId/close`
Chiudi ticket con note risolutive

**Request:**
```json
{
  "resolutionNotes": "Problema risolto: cliente informato su parcheggio P5"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "status": "RESOLVED",
      "resolvedAt": "2025-10-21T10:30:00Z",
      "resolutionNotes": "..."
    }
  }
}
```

**Side Effects:**
- Cambia `status` → `RESOLVED`
- Setta `resolvedAt` e `resolutionNotes`
- Incrementa `operator.totalTicketsHandled`
- Invia messaggio WhatsApp/Email al cliente con risoluzione
- Emette WebSocket `ticket_resolved`

---

### 4. KNOWLEDGE ROUTES (`/api/knowledge`)

#### `GET /api/knowledge`
Lista documenti knowledge base

**Query Params:**
- `category`: `PARCHEGGIO | BIGLIETTI | ORARI | ACCESSO | SERVIZI | ALTRO`
- `isActive`: `true | false`
- `search`: Ricerca full-text (question + answer)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "question": "Dove posso parcheggiare?",
        "answer": "Sono disponibili i parcheggi P1, P2, P5...",
        "category": "PARCHEGGIO",
        "isActive": true,
        "timesUsed": 45,
        "lastUsedAt": "2025-10-21T09:00:00Z",
        "createdBy": "uuid",
        "creator": {
          "name": "Admin User"
        },
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "total": 20
  }
}
```

---

#### `POST /api/knowledge`
Aggiungi documento a knowledge base

**Request:**
```json
{
  "question": "Quali sono gli orari di apertura?",
  "answer": "Le Lucine sono aperte tutti i giorni dalle 17:00 alle 23:00",
  "category": "ORARI"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "uuid",
      ...
    }
  }
}
```

**Side Effects:**
- Crea KnowledgeItem in DB
- Genera embedding con OpenAI API (question + answer concatenati)
- Salva embedding in campo `vector(1536)`
- Disponibile immediatamente per AI queries

---

#### `PATCH /api/knowledge/:itemId`
Modifica documento

**Request:**
```json
{
  "question": "Nuova domanda aggiornata",
  "answer": "Nuova risposta aggiornata",
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "item": {...}
  }
}
```

**Side Effects:**
- Rigenera embedding se question/answer modificati

---

#### `DELETE /api/knowledge/:itemId`
Elimina documento (soft delete → isActive = false)

**Response (200):**
```json
{
  "success": true,
  "message": "Knowledge item deactivated"
}
```

---

#### `POST /api/knowledge/search`
Ricerca semantica (vector search)

**Request:**
```json
{
  "query": "dove posso parcheggiare vicino all'eremo?",
  "limit": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "item": {
          "id": "uuid",
          "question": "Dove posso parcheggiare?",
          "answer": "...",
          "category": "PARCHEGGIO"
        },
        "similarity": 0.92  // 0-1 cosine similarity
      }
    ]
  }
}
```

**Implementation:**
```sql
SELECT *,
  (embedding <=> $queryEmbedding) AS distance,
  1 - (embedding <=> $queryEmbedding) AS similarity
FROM KnowledgeItem
WHERE isActive = true
ORDER BY similarity DESC
LIMIT 5;
```

---

### 5. OPERATOR ROUTES (`/api/operators`)

#### `GET /api/operators`
Lista operatori (admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "operators": [
      {
        "id": "uuid",
        "email": "operatore1@lucine.it",
        "name": "Operatore 1",
        "role": "OPERATOR",
        "isOnline": true,
        "lastSeenAt": "2025-10-21T10:00:00Z",
        "totalChatsHandled": 123,
        "totalTicketsHandled": 45,
        "averageRating": 4.5,
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ]
  }
}
```

---

#### `GET /api/operators/me`
Profilo operatore corrente (authenticated)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "operator": {
      "id": "uuid",
      "email": "admin@lucine.it",
      "name": "Admin User",
      "role": "ADMIN",
      "isOnline": false,
      "whatsappNumber": null,
      "notificationPreferences": {...},
      "totalChatsHandled": 0,
      "totalTicketsHandled": 0
    }
  }
}
```

---

#### `PATCH /api/operators/me`
Modifica profilo corrente

**Request:**
```json
{
  "name": "Nuovo Nome",
  "whatsappNumber": "+39123456789",
  "notificationPreferences": {
    "email": {
      "newChat": true,
      "newTicket": true
    }
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "operator": {...}
  }
}
```

---

#### `GET /api/operators/me/toggle-availability`
Toggle online/offline

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isOnline": true
  }
}
```

**Side Effects:**
- Toggle `isOnline`
- Aggiorna `lastSeenAt`
- Emette WebSocket `operator_status_changed`

---

#### `POST /api/operators` (ADMIN ONLY)
Crea nuovo operatore

**Request:**
```json
{
  "email": "nuovo@lucine.it",
  "password": "password123",
  "name": "Nuovo Operatore",
  "role": "OPERATOR"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "operator": {
      "id": "uuid",
      "email": "nuovo@lucine.it",
      "name": "Nuovo Operatore",
      "role": "OPERATOR"
    }
  }
}
```

---

### 6. SETTINGS ROUTES (`/api/settings`)

#### `GET /api/settings` (ADMIN ONLY)
Tutti settings

**Response (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "ai": {
        "confidenceThreshold": 0.7,
        "model": "gpt-4-turbo-preview",
        "maxTokens": 500
      },
      "chat": {
        "timeoutMinutes": 10,
        "maxChatsPerOperator": 3
      },
      "whatsapp": {
        "number": "whatsapp:+14155238886"
      },
      "email": {
        "from": "support@lucine.it"
      }
    }
  }
}
```

**Note:** API keys sensibili (OPENAI_API_KEY, TWILIO_AUTH_TOKEN) NON esposte

---

#### `PATCH /api/settings` (ADMIN ONLY)
Aggiorna settings

**Request:**
```json
{
  "ai.confidenceThreshold": 0.75,
  "chat.timeoutMinutes": 15
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Settings updated"
}
```

---

## WEBSOCKET EVENTS

### Connection
```javascript
const socket = io('https://chatbot-lucy-2025.onrender.com', {
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

### Server → Client Events

#### `connect`
Connessione stabilita

**Action:** Client deve emettere `operator_join`

---

#### `new_chat_request`
Nuova chat in coda

**Payload:**
```json
{
  "sessionId": "uuid",
  "userName": "Mario Rossi",
  "initialMessage": "Ciao, vorrei informazioni...",
  "timestamp": "2025-10-21T10:00:00Z"
}
```

**Action Dashboard:**
- Mostra toast notification
- Aggiungi a lista chat in ChatListPanel
- Suona notifica audio (se enabled)

---

#### `new_message`
Nuovo messaggio in chat

**Payload:**
```json
{
  "sessionId": "uuid",
  "message": {
    "id": "msg_uuid",
    "sender": "USER",
    "content": "Messaggio dal cliente",
    "timestamp": "2025-10-21T10:05:00Z"
  }
}
```

**Action Dashboard:**
- Se chat aperta → Aggiungi messaggio a ChatWindow
- Se chat non aperta → Badge unread count
- Update `lastMessageAt` in ChatListPanel

---

#### `chat_assigned`
Chat assegnata a operatore

**Payload:**
```json
{
  "sessionId": "uuid",
  "operatorId": "uuid",
  "operatorName": "Operatore 1"
}
```

**Action Dashboard:**
- Se assegnata a me → Mostra toast "Chat assegnata"
- Update status chat in lista

---

#### `chat_closed`
Chat chiusa

**Payload:**
```json
{
  "sessionId": "uuid",
  "closedBy": "uuid",
  "closedAt": "2025-10-21T10:15:00Z"
}
```

**Action Dashboard:**
- Rimuovi da lista chat attive
- Chiudi ChatWindow se aperta

---

#### `new_ticket_created`
Nuovo ticket creato

**Payload:**
```json
{
  "ticketId": "uuid",
  "userName": "Mario Rossi",
  "contactMethod": "WHATSAPP",
  "priority": "NORMAL"
}
```

**Action Dashboard:**
- Toast notification
- Incrementa badge ticket pending

---

#### `ticket_resumed`
Cliente risponde a ticket via WhatsApp/Email

**Payload:**
```json
{
  "ticketId": "uuid",
  "userName": "Mario Rossi",
  "newMessage": "Grazie per la risposta..."
}
```

**Action Dashboard:**
- Toast notification
- Update ticket in lista

---

#### `operator_status_changed`
Status operatore cambiato

**Payload:**
```json
{
  "operatorId": "uuid",
  "isOnline": true
}
```

**Action Dashboard:**
- Update indicator status in OperatorSidebar

---

### Client → Server Events

#### `operator_join`
Operatore si connette

**Emit:**
```javascript
socket.emit('operator_join', {
  operatorId: 'uuid'
});
```

**Action Server:**
- Setta `operator.isOnline = true`
- Broadcast `operator_status_changed` agli altri operatori

---

#### `operator_leave`
Operatore si disconnette

**Emit:**
```javascript
socket.emit('operator_leave', {
  operatorId: 'uuid'
});
```

**Action Server:**
- Setta `operator.isOnline = false`
- Broadcast `operator_status_changed`

---

#### `send_message`
Operatore invia messaggio

**Emit:**
```javascript
socket.emit('send_message', {
  sessionId: 'uuid',
  content: 'Messaggio...'
});
```

**Action Server:**
- Salva messaggio in DB
- Broadcast `new_message` a tutti i client (incluso widget)
- Update `lastMessageAt`

---

## TYPESCRIPT TYPES

### Frontend Types (`src/types/index.ts`)

```typescript
// Enums
export enum OperatorRole {
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
}

export enum ChatStatus {
  ACTIVE = 'ACTIVE',
  WAITING = 'WAITING',
  WITH_OPERATOR = 'WITH_OPERATOR',
  CLOSED = 'CLOSED',
  TICKET_CREATED = 'TICKET_CREATED',
}

export enum TicketStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

export enum TicketPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

export enum ContactMethod {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
}

export enum KnowledgeCategory {
  PARCHEGGIO = 'PARCHEGGIO',
  BIGLIETTI = 'BIGLIETTI',
  ORARI = 'ORARI',
  ACCESSO = 'ACCESSO',
  SERVIZI = 'SERVIZI',
  ALTRO = 'ALTRO',
}

// Models
export interface Operator {
  id: string;
  email: string;
  name: string;
  role: OperatorRole;
  isOnline: boolean;
  lastSeenAt: string;
  whatsappNumber?: string;
  notificationPreferences?: NotificationPreferences;
  totalChatsHandled: number;
  totalTicketsHandled: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI' | 'OPERATOR';
  content: string;
  timestamp: string;
  confidence?: number;
}

export interface ChatSession {
  id: string;
  userName?: string;
  userAgent?: string;
  status: ChatStatus;
  messages: ChatMessage[];
  aiConfidence?: number;
  aiTokensUsed: number;
  operatorId?: string;
  operator?: Operator;
  operatorJoinedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  closedAt?: string;
}

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
  operator?: Operator;
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

export interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  category: KnowledgeCategory;
  isActive: boolean;
  timesUsed: number;
  lastUsedAt?: string;
  createdBy: string;
  creator?: Operator;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  recipientId?: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  sentViaEmail: boolean;
  sentViaWhatsApp: boolean;
  sentViaInApp: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  email: {
    newChat: boolean;
    newTicket: boolean;
    ticketResumed: boolean;
  };
  whatsapp: {
    newChat: boolean;
    newTicket: boolean;
    ticketResumed: boolean;
  };
  inApp: {
    newChat: boolean;
    newTicket: boolean;
    chatMessage: boolean;
    ticketResumed: boolean;
  };
  audio: {
    newChat: boolean;
    newTicket: boolean;
    chatMessage: boolean;
    ticketResumed: boolean;
  };
  quietHours: {
    start: string; // "22:00"
    end: string; // "08:00"
  };
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// WebSocket Events
export interface WebSocketEvent {
  event: string;
  data: any;
}
```

---

## ENVIRONMENT VARIABLES

### Backend (`.env`)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Server
PORT=3000
NODE_ENV="production"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGINS="https://chatbot-lucy-2025-1.onrender.com,https://your-shopify-store.myshopify.com"

# OpenAI
OPENAI_API_KEY="sk-..."

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
TWILIO_WEBHOOK_URL="https://chatbot-lucy-2025.onrender.com/api/webhooks/twilio"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="support@lucine.it"
SMTP_PASSWORD="..."
EMAIL_FROM="Lucine Support <support@lucine.it>"

# AI Settings (optional, can use SystemSettings)
AI_CONFIDENCE_THRESHOLD=0.7
AI_MODEL="gpt-4-turbo-preview"
AI_MAX_TOKENS=500

# Chat Settings
CHAT_TIMEOUT_MINUTES=10
MAX_CHATS_PER_OPERATOR=3
```

### Frontend Dashboard (`.env`)
```bash
VITE_API_URL="https://chatbot-lucy-2025.onrender.com"
VITE_WS_URL="https://chatbot-lucy-2025.onrender.com"
```

**IMPORTANTE:** NON includere API keys sensibili nel frontend!

---

## SECURITY & AUTH

### JWT Token
**Generazione (Login):**
```javascript
const token = jwt.sign(
  {
    operatorId: operator.id,
    email: operator.email,
    role: operator.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
```

**Verifica (Middleware):**
```javascript
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('No token');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.operator = await prisma.operator.findUnique({
      where: { id: decoded.operatorId },
    });

    if (!req.operator) throw new Error('Operator not found');

    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
  }
};
```

### Role-Based Access Control (RBAC)
```javascript
const requireAdmin = (req, res, next) => {
  if (req.operator.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }
  next();
};

// Usage
app.post('/api/operators', authMiddleware, requireAdmin, createOperator);
```

---

## ERROR HANDLING

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message here",
    "code": "ERROR_CODE",
    "details": {...}  // optional
  }
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token / invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Unique constraint violated
- `AI_ERROR` - OpenAI API error
- `TWILIO_ERROR` - Twilio API error
- `EMAIL_ERROR` - Email send error

---

## ESEMPI RICHIESTE

### Login e Setup
```typescript
// 1. Login
const loginResponse = await axios.post('https://chatbot-lucy-2025.onrender.com/api/auth/login', {
  email: 'admin@lucine.it',
  password: 'admin123'
});

const token = loginResponse.data.data.token;
const operator = loginResponse.data.data.operator;

// Store token
localStorage.setItem('auth_token', token);

// 2. Setup Axios instance
const api = axios.create({
  baseURL: 'https://chatbot-lucy-2025.onrender.com',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// 3. Connect WebSocket
const socket = io('https://chatbot-lucy-2025.onrender.com', {
  auth: { token },
});

socket.on('connect', () => {
  socket.emit('operator_join', { operatorId: operator.id });
});
```

### Fetch Chat Sessions
```typescript
const response = await api.get('/api/chat/sessions', {
  params: {
    status: 'WAITING',
    limit: 20,
  },
});

const chats = response.data.data.sessions;
```

### Take Chat (Assign to Self)
```typescript
const response = await api.post(`/api/chat/sessions/${chatId}/assign`);
// Chat now assigned, status = WITH_OPERATOR
```

### Send Message
```typescript
const response = await api.post(`/api/chat/sessions/${chatId}/messages`, {
  content: 'Ciao! Come posso aiutarti?',
});

// Message will be broadcast via WebSocket to all clients
```

### Close Chat
```typescript
const response = await api.post(`/api/chat/sessions/${chatId}/close`, {
  notes: 'Cliente soddisfatto',
});
```

### Create Knowledge Item
```typescript
const response = await api.post('/api/knowledge', {
  question: 'Dove posso parcheggiare?',
  answer: 'Parcheggi disponibili: P1, P2, P5 con navetta gratuita',
  category: 'PARCHEGGIO',
});
// Item will be available immediately for AI
```

### Upload Settings (Admin)
```typescript
const response = await api.patch('/api/settings', {
  'ai.confidenceThreshold': 0.75,
  'chat.timeoutMinutes': 15,
});
```

---

## AGGIORNARE QUESTO DOCUMENTO

**Quando aggiornare:**
- ✅ Aggiungi nuovo endpoint API → Documenta request/response
- ✅ Modifichi database schema → Aggiorna sezione Prisma
- ✅ Aggiungi WebSocket event → Documenta payload e action
- ✅ Nuovi types TypeScript → Aggiungi in sezione Types
- ✅ Cambi env vars → Aggiorna sezione Environment
- ✅ Nuovi error codes → Aggiungi in Error Handling

**Ultima modifica:** 2025-10-21 - Creazione schema tecnico iniziale
