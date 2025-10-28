# Lucine Chatbot - Project Onboarding per AI

**Data**: 27 Ottobre 2025
**Scopo**: Documento completo per permettere a un'AI di comprendere il progetto e iniziare a lavorare immediatamente

---

## 📋 Indice

1. [Overview Progetto](#overview-progetto)
2. [Struttura Repository](#struttura-repository)
3. [Stack Tecnologico](#stack-tecnologico)
4. [Architettura Sistema](#architettura-sistema)
5. [File e Directory Chiave](#file-e-directory-chiave)
6. [Problemi da Risolvere](#problemi-da-risolvere)
7. [Workflow di Lavoro](#workflow-di-lavoro)
8. [Comandi Utili](#comandi-utili)
9. [Documentazione Esistente](#documentazione-esistente)
10. [Deployment](#deployment)

---

## Overview Progetto

### Cos'è Lucine Chatbot?

Sistema chatbot completo per **Lucine di Natale** (evento natalizio a Leggiuno, Varese) che combina:
- **AI Assistant** (GPT-4) con RAG (Retrieval Augmented Generation) usando pgvector
- **Live Chat** con operatori umani
- **Ticket System** per richieste asincrone
- **Dashboard** operatore per gestione chat/ticket/knowledge base
- **Widget Shopify** integrato nel sito e-commerce

### Funzionalità Principali

1. **Chat Widget** sul sito Shopify
2. **AI risponde** usando knowledge base (semantic search con embeddings)
3. **Handoff a operatore umano** quando necessario
4. **Ticket creation** quando operatori offline
5. **Dashboard operatore** per gestire tutto
6. **Analytics** e reporting

### Stato Attuale

- ✅ Backend funzionante e deployato (Render.com)
- ✅ Dashboard funzionante e deployata (Render.com)
- ✅ Widget Shopify integrato
- ✅ AI con semantic search (pgvector) funzionante
- ⚠️ **4 bugs critici identificati** (vedi sezione Problemi)
- 🟡 Widget subtitle removal in corso

---

## Struttura Repository

### 📁 Directory sul Desktop

```
/Users/brnobtt/Desktop/
│
├── lucine-production/              # 🎯 MAIN REPOSITORY - Backend + Dashboard
│   ├── backend/                    # Express.js API + Socket.IO
│   │   ├── src/
│   │   │   ├── controllers/       # API controllers
│   │   │   ├── services/          # Business logic
│   │   │   ├── config/            # Configuration
│   │   │   └── server.js          # Entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Database schema
│   │   │   └── migrations/        # DB migrations
│   │   ├── .env                   # Environment variables (NON committato)
│   │   └── package.json
│   │
│   ├── frontend-dashboard/         # ❌ OLD - Non usata (deprecata)
│   │
│   ├── src/                        # 🎯 Dashboard React/TypeScript
│   │   ├── components/
│   │   │   └── dashboard/         # Dashboard components
│   │   ├── pages/                 # Pages (Chat, Tickets, Knowledge, Settings)
│   │   ├── lib/                   # API client, utils
│   │   ├── contexts/              # React contexts (Auth, Socket)
│   │   └── types/                 # TypeScript types
│   │
│   ├── docs/                       # 📚 Documentazione progetto
│   │   ├── CHAT_FLOWS_ANALYSIS.md # Analisi flussi chat (NUOVO)
│   │   ├── CURRENT_STATUS.md      # Stato attuale
│   │   ├── ROADMAP.md             # Fix da fare
│   │   ├── IMPLEMENTATION_SUMMARY.md
│   │   ├── TESTING_GUIDE.md
│   │   └── ...
│   │
│   ├── .git/                       # Git repository
│   └── README.md
│
├── lucine-minimal/                 # 🎯 WIDGET REPOSITORY - Shopify Theme
│   ├── snippets/
│   │   └── chatbot-popup.liquid   # 🔥 WIDGET CODE (file principale)
│   ├── layout/
│   │   └── theme.liquid            # Theme layout (include widget)
│   ├── assets/                     # CSS, JS, fonts
│   ├── templates/                  # Shopify templates
│   ├── .git/                       # Git repository (separato!)
│   └── README.md
│
└── BACKUP/                         # Backup files (non modificare)
```

### Git Repositories

| Repository | Path | Remote | Branch | Stato |
|------------|------|--------|--------|-------|
| **lucine-production** | `/Users/brnobtt/Desktop/lucine-production` | `https://github.com/mujians/lucine-production.git` | `main` | ✅ Pushato |
| **lucine-minimal** | `/Users/brnobtt/Desktop/lucine-minimal` | `https://github.com/mujians/lucine25minimal.git` | `main` | ⚠️ Mai committato (in staging) |

⚠️ **IMPORTANTE**: `lucine-minimal` non ha ancora commit! Tutti i file sono in staging area ma non c'è commit iniziale.

---

## Stack Tecnologico

### Backend (lucine-production/backend/)

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| **Node.js** | 20.x | Runtime |
| **Express.js** | 4.x | Web framework |
| **Socket.IO** | 4.x | Real-time WebSocket |
| **Prisma** | Latest | ORM per PostgreSQL |
| **PostgreSQL** | 15 | Database con pgvector |
| **OpenAI API** | gpt-4 | AI responses + embeddings |
| **Nodemailer** | Latest | Email notifications |
| **Twilio** | Latest | WhatsApp notifications |

### Dashboard Frontend (lucine-production/src/)

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| **React** | 18.x | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | Latest | Build tool |
| **Tailwind CSS** | 3.x | Styling |
| **shadcn/ui** | Latest | UI components |
| **Axios** | Latest | HTTP client |
| **Socket.IO Client** | 4.x | Real-time connection |

### Widget (lucine-minimal/snippets/chatbot-popup.liquid)

| Tecnologia | Scopo |
|------------|-------|
| **Shopify Liquid** | Template engine |
| **Vanilla JavaScript** | Widget logic (no framework) |
| **Socket.IO Client CDN** | Real-time connection |
| **CSS** | Styling (scoped) |

### Database (Render.com)

| Servizio | Database | Extensions |
|----------|----------|------------|
| **PostgreSQL 15** | `lucine-chatbot-db` | `pgvector` (per embeddings) |

---

## Architettura Sistema

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY WEBSITE                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Widget (chatbot-popup.liquid)                       │   │
│  │  - Vanilla JS + Socket.IO                            │   │
│  │  - User chat interface                               │   │
│  └───────────────┬──────────────────────────────────────┘   │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   │ HTTPS + WebSocket
                   ▼
┌─────────────────────────────────────────────────────────────┐
│         BACKEND (Render.com - chatbot-lucy-2025)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js + Socket.IO Server                       │   │
│  │  - REST API endpoints                                │   │
│  │  - WebSocket real-time events                        │   │
│  │  - OpenAI integration (GPT-4 + embeddings)           │   │
│  └─────┬────────────────────────────────────────────────┘   │
│        │                                                     │
│        ├─► Prisma ORM                                       │
│        │   └─► PostgreSQL (pgvector)                        │
│        │       - ChatSession, Ticket, KnowledgeItem         │
│        │       - Operator, SystemSettings                   │
│        │                                                     │
│        ├─► OpenAI API                                       │
│        │   - GPT-4 chat completions                         │
│        │   - text-embedding-3-small                         │
│        │                                                     │
│        ├─► Email Service (Nodemailer + SMTP)               │
│        └─► Twilio Service (WhatsApp)                       │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ HTTPS + WebSocket
                   ▼
┌─────────────────────────────────────────────────────────────┐
│      DASHBOARD (Render.com - lucine-dashboard)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React SPA + TypeScript                              │   │
│  │  - Chat management                                   │   │
│  │  - Ticket management                                 │   │
│  │  - Knowledge base CRUD                               │   │
│  │  - System settings                                   │   │
│  │  - Operator management                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema (Prisma)

**File**: `backend/prisma/schema.prisma`

**Main Models**:
```prisma
// Chat sessions
model ChatSession {
  id              String    @id @default(uuid())
  userName        String?
  status          ChatStatus // ACTIVE, WITH_OPERATOR, CLOSED, TICKET_CREATED
  messages        String    @db.Text  // JSON serialized
  operatorId      String?
  operator        Operator? @relation(...)
  isArchived      Boolean   @default(false)
  isFlagged       Boolean   @default(false)
  createdAt       DateTime
  lastMessageAt   DateTime?
}

// Tickets
model Ticket {
  id                    String        @id @default(uuid())
  userName              String
  contactMethod         ContactMethod // EMAIL, WHATSAPP
  email                 String?
  whatsappNumber        String?
  status                TicketStatus  // PENDING, ASSIGNED, OPEN, RESOLVED
  initialMessage        String        @db.Text
  priority              Priority      // NORMAL, HIGH, URGENT
  sessionId             String
  session               ChatSession   @relation(...)
  operatorId            String?
  resumeToken           String        @unique
  resumeTokenExpiresAt  DateTime
  createdAt             DateTime
}

// Knowledge Base
model KnowledgeItem {
  id          String    @id @default(uuid())
  question    String    @db.Text
  answer      String    @db.Text
  category    KBCategory
  embedding   String?   @db.Text  // JSON serialized vector
  isActive    Boolean   @default(true)
  createdBy   String
  creator     Operator  @relation(...)
  createdAt   DateTime
}

// Operators
model Operator {
  id                        String   @id @default(uuid())
  email                     String   @unique
  passwordHash              String
  name                      String
  role                      Role     // OPERATOR, ADMIN
  isOnline                  Boolean  @default(false)
  isAvailable               Boolean  @default(true)
  totalChatsHandled         Int      @default(0)
  totalTicketsHandled       Int      @default(0)
  notificationPreferences   Json?
  whatsappNumber            String?
}

// System Settings
model SystemSettings {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String   @db.Text  // FIXED: was Json, now String
  description String?
  updatedAt   DateTime
}
```

### API Endpoints

**Base URL**: `https://chatbot-lucy-2025.onrender.com`

#### Public Endpoints (Widget)
```
POST   /api/chat/session                    # Create new chat session
GET    /api/chat/session/:sessionId         # Get session
POST   /api/chat/session/:sessionId/message # Send user message
POST   /api/chat/session/:sessionId/request-operator  # Request human operator
POST   /api/tickets                         # Create ticket
GET    /api/tickets/resume/:token           # Resume ticket by token
GET    /api/settings/public                 # Get public settings (widget config)
```

#### Protected Endpoints (Dashboard - require auth)
```
# Auth
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# Chat Management
GET    /api/chat/sessions                   # List all chats (filters: status, operator, search)
POST   /api/chat/sessions/:id/close         # Close chat
POST   /api/chat/sessions/:id/archive       # Archive chat
POST   /api/chat/sessions/:id/flag          # Flag chat with reason
POST   /api/chat/sessions/:id/transfer      # Transfer to another operator
DELETE /api/chat/sessions/:id               # Soft delete

# Tickets
GET    /api/tickets                          # List tickets
GET    /api/tickets/:id                      # Get ticket details
POST   /api/tickets/:id/assign               # Assign to current operator
POST   /api/tickets/:id/resolve              # Mark as resolved
POST   /api/chat/:sessionId/convert-to-ticket # Convert chat to ticket

# Knowledge Base
GET    /api/knowledge                        # List KB items (filters: category, active, search)
GET    /api/knowledge/:id                    # Get single item
POST   /api/knowledge                        # Create item (+ generate embedding)
PUT    /api/knowledge/:id                    # Update item (+ regenerate embedding)
DELETE /api/knowledge/:id                    # Delete item
PATCH  /api/knowledge/:id/toggle             # Toggle active status
POST   /api/knowledge/bulk                   # Bulk import (CSV/JSON)
POST   /api/knowledge/regenerate-embeddings  # Regenerate all embeddings

# Operators
GET    /api/operators                        # List all operators (admin only)
GET    /api/operators/online                 # List online & available operators
POST   /api/operators                        # Create operator (admin only)
PUT    /api/operators/:id                    # Update operator (admin only)
DELETE /api/operators/:id                    # Delete operator (admin only)
POST   /api/operators/me/toggle-availability # Toggle availability
PUT    /api/operators/me/notification-preferences # Update notifications

# Settings
GET    /api/settings                         # Get all settings
PUT    /api/settings                         # Update settings (bulk)
GET    /api/settings/:key                    # Get single setting

# Analytics
GET    /api/analytics/overview               # Dashboard stats
GET    /api/analytics/chats                  # Chat metrics
GET    /api/analytics/tickets                # Ticket metrics
```

### Socket.IO Events

#### Client → Server (Both Widget & Dashboard)
```javascript
// Join room
emit('join_chat', sessionId)              // Widget joins specific chat
emit('join_dashboard')                    // Dashboard joins monitoring room
emit('join_operator', operatorId)         // Operator joins personal room

// Send message
emit('send_message', { sessionId, message, operatorId })
```

#### Server → Client (Widget)
```javascript
// Chat events
on('chat_joined', { sessionId })
on('new_message', { message })            // AI or system message
on('operator_message', { message, operatorName })  // Operator response
on('operator_assigned', { operatorId, operatorName })
on('operator_joined', { operatorName })
on('chat_closed', { sessionId, message })
```

#### Server → Client (Dashboard)
```javascript
// Chat events
on('new_chat_request', { sessionId, userName, lastMessage })  // ❌ NOT LISTENED!
on('user_message', { sessionId, message })
on('chat_assigned', { sessionId, operatorId })
on('chat_closed', { sessionId })
on('chat_archived', { sessionId })
on('chat_flagged', { sessionId, reason })
on('chat_transferred', { sessionId, fromOperatorId, toOperatorId })

// Ticket events
on('new_ticket_created', { ticketId, userName, contactMethod })
on('ticket_assigned', { ticketId, operatorId })
on('ticket_resolved', { ticketId })
on('ticket_resumed', { ticketId, userName })

// Operator events
on('operator_availability_changed', { operatorId, isOnline, isAvailable })
```

---

## File e Directory Chiave

### Backend Files (lucine-production/backend/)

| File | Scopo | Importante? |
|------|-------|-------------|
| `src/server.js` | Entry point, Express setup, Socket.IO init | 🔥 |
| `src/controllers/chat.controller.js` | Chat endpoints + operator request logic | 🔥 |
| `src/controllers/ticket.controller.js` | Ticket CRUD + resume | 🔥 |
| `src/controllers/knowledge.controller.js` | KB CRUD + embeddings | 🔥 |
| `src/controllers/operator.controller.js` | Operator management | ⭐ |
| `src/services/openai.service.js` | AI responses + semantic search + embeddings | 🔥 |
| `src/services/email.service.js` | Email notifications via SMTP | ⭐ |
| `src/services/twilio.service.js` | WhatsApp via Twilio | ⭐ |
| `src/config/index.js` | Configuration loader (ENV + defaults) | 🔥 |
| `prisma/schema.prisma` | Database schema | 🔥 |
| `.env` | Environment variables (SECRET!) | 🔥 |

### Dashboard Files (lucine-production/src/)

| File | Scopo | Importante? |
|------|-------|-------------|
| `pages/Chat.tsx` | Chat management page | 🔥 |
| `pages/Tickets.tsx` | Ticket management page | ⭐ |
| `pages/Knowledge.tsx` | KB management page | ⭐ |
| `pages/Settings.tsx` | System settings page | 🔥 |
| `components/dashboard/ChatWindow.tsx` | Chat view & messages | 🔥 |
| `contexts/AuthContext.tsx` | Authentication context | ⭐ |
| `contexts/SocketContext.tsx` | Socket.IO connection | 🔥 |
| `lib/api.ts` | API client (axios) | 🔥 |

### Widget Files (lucine-minimal/)

| File | Scopo | Importante? |
|------|-------|-------------|
| `snippets/chatbot-popup.liquid` | **TUTTO IL WIDGET** (HTML + CSS + JS) | 🔥🔥🔥 |
| `layout/theme.liquid` | Include widget snippet | ⭐ |

**NOTA**: Il widget è UN SOLO FILE! `chatbot-popup.liquid` contiene:
- HTML structure
- CSS styles (inline `<style>`)
- JavaScript logic (inline `<script>`)
- Socket.IO client CDN

### Documentation Files (lucine-production/docs/)

| File | Contenuto | Quando usarlo |
|------|-----------|---------------|
| `PROJECT_ONBOARDING.md` | **QUESTO FILE** | Per iniziare |
| `CHAT_FLOWS_ANALYSIS.md` | Analisi flussi chat + bugs | Per capire bugs |
| `CURRENT_STATUS.md` | Stato attuale progetto | Per status update |
| `ROADMAP.md` | Tutti i fix da fare (P0/P1/P2) | Per priorità lavoro |
| `IMPLEMENTATION_SUMMARY.md` | Panoramica completa sistema | Per overview |
| `TESTING_GUIDE.md` | Come testare tutto | Per QA |
| `SEMANTIC_SEARCH_DEPLOYMENT.md` | Setup pgvector | Per capire semantic search |
| `RENDER_DEPLOYMENT.md` | Deploy su Render | Per deployment |

---

## Problemi da Risolvere

### 🔴 P0 - BLOCKERS CRITICI (Fix Immediately)

#### P0.3 - Widget No Ticket Action quando operatori offline
**Status**: ❌ DA FIXARE
**Impact**: 🔴 CRITICO - User bloccato
**Effort**: 10 minuti

**File**: `lucine-minimal/snippets/chatbot-popup.liquid:992-995`

**Problema**:
```javascript
// CURRENT CODE (BROKEN)
if (operatorData.data?.operatorAvailable === false) {
  addMessage(operatorData.data.message || 'Nessun operatore disponibile al momento.', 'bot');
  // ❌ STOP HERE - No actions!
}
```

**Fix Required**:
```javascript
if (operatorData.data?.operatorAvailable === false) {
  addMessage(operatorData.data.message || 'Nessun operatore disponibile al momento.', 'bot');

  // ✅ ADD THIS:
  showSmartActions([
    {
      icon: '📝',
      text: 'Apri Ticket',
      description: 'Lascia un messaggio, ti ricontatteremo',
      action: 'request_ticket',
      type: 'primary'
    },
    {
      icon: '🤖',
      text: 'Continua con AI',
      description: 'Prova a chiedermi altro',
      action: 'continue_ai',
      type: 'secondary'
    }
  ]);
}
```

**Testing**:
1. Dashboard: Impostare tutti operatori `isAvailable = false`
2. Widget: Chiedere operatore
3. Verificare smart actions appaiono
4. Click "Apri Ticket" → dovrebbe mostrare form

**Details**: `docs/CHAT_FLOWS_ANALYSIS.md` - Bug #1

---

#### P0.4 - Action `request_ticket` non implementata
**Status**: ❌ DA FIXARE
**Impact**: 🔴 CRITICO - Ticket form inaccessibile
**Effort**: 5 minuti

**File**: `lucine-minimal/snippets/chatbot-popup.liquid:1207`

**Problema**:
```javascript
// CURRENT CODE (BROKEN)
actionButton.addEventListener('click', () => {
  // ...other actions...
  } else if (action.action === 'request_ticket') {
    sendMessage('apri ticket');  // ❌ WRONG! Sends as text message
  }
  // ...
});
```

**Fix Required**:
```javascript
} else if (action.action === 'request_ticket') {
  showTicketForm();  // ✅ Call the form function
  actionsContainer.remove();
}
```

**Testing**:
1. Trigger smart action "Apri Ticket"
2. Verificare form HTML appare (nome, email, messaggio)
3. Compilare e submit
4. Verificare ticket creato in dashboard

**Details**: `docs/CHAT_FLOWS_ANALYSIS.md` - Bug #2

---

#### P0.5 - lucine-minimal repository mai committato
**Status**: ❌ DA FIXARE
**Impact**: 🟠 ALTO - Nessun version control
**Effort**: 2 minuti

**Path**: `/Users/brnobtt/Desktop/lucine-minimal`

**Problema**:
- Repository inizializzato (`git init` fatto)
- Remote configurato (`origin = https://github.com/mujians/lucine25minimal.git`)
- Tutti i file in staging area
- ❌ **ZERO commits**! `fatal: il tuo branch corrente 'main' non ha ancora commit`

**Fix Required**:
```bash
cd /Users/brnobtt/Desktop/lucine-minimal

# Remove lock file if exists
rm -f .git/refs/heads/main.lock

# Create initial commit
git commit -m "Initial commit: Lucine Shopify theme with chatbot widget

- Complete Shopify theme setup
- Integrated chatbot widget (snippets/chatbot-popup.liquid)
- Widget shows single greeting message (subtitle removed)
- Custom fonts and assets
- Product pages, templates, sections configured

🤖 Generated with Claude Code"

# Push to GitHub
git push -u origin main
```

**Note**: Questo commit include già il fix subtitle removal fatto precedentemente.

---

### 🟠 P1 - HIGH PRIORITY (Fix Before Testing)

#### P1.6 - Dashboard No Notifications per Nuove Chat
**Status**: ❌ DA FIXARE
**Impact**: 🟠 ALTO - Operatore non sa di chat pending
**Effort**: 2-3 ore

**Files**: Dashboard components (multiple)

**Problema**:
- Backend emette: `io.to('operator:${operatorId}').emit('new_chat_request', {...})`
- Dashboard SocketContext.tsx: ❌ **NON ascolta** questo evento
- ❌ Nessuna notifica browser
- ❌ Nessun badge count
- ❌ Nessun suono

**Fix Required**:

1. **Aggiungere listener in SocketContext.tsx**:
```typescript
// src/contexts/SocketContext.tsx
socket.on('new_chat_request', (data) => {
  console.log('New chat assigned:', data);

  // Show browser notification
  if (Notification.permission === 'granted') {
    new Notification('Nuova Chat Assegnata', {
      body: `${data.userName}: ${data.lastMessage}`,
      icon: '/logo.png',
      requireInteraction: true
    });
  }

  // Play sound (optional)
  const audio = new Audio('/notification.mp3');
  audio.play().catch(e => console.log('Audio play failed:', e));

  // Increment badge count
  setPendingChatsCount(prev => prev + 1);

  // Emit custom event for chat list to refresh
  window.dispatchEvent(new CustomEvent('new_chat_assigned', { detail: data }));
});
```

2. **Request notification permissions on login**:
```typescript
// src/contexts/AuthContext.tsx or Dashboard layout
useEffect(() => {
  if (operator && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, [operator]);
```

3. **Add badge count to sidebar/header**:
```typescript
// Add state for pending chats count
const [pendingChatsCount, setPendingChatsCount] = useState(0);

// Badge UI
{pendingChatsCount > 0 && (
  <span className="badge">{pendingChatsCount}</span>
)}
```

**Testing**:
1. Login come operatore, impostare `isAvailable = true`
2. Da widget: richiedere operatore
3. Verificare notifica browser appare
4. Verificare badge count incrementa
5. Verificare lista chat si aggiorna

**Details**: `docs/CHAT_FLOWS_ANALYSIS.md` - Bug #3

---

#### P1.7 - Widget Input Non Disabilitata Dopo Chat Chiusa
**Status**: ❌ DA FIXARE
**Impact**: 🟡 MEDIO - UX confusa
**Effort**: 10 minuti

**File**: `lucine-minimal/snippets/chatbot-popup.liquid:1472-1476`

**Problema**:
```javascript
// CURRENT CODE (INCOMPLETE)
socket.on('chat_closed', (data) => {
  addMessage('La chat è stata chiusa. Grazie per averci contattato!', 'system');
  isOperatorMode = false;
  // ❌ MISSING: disable input
});
```

**Fix Required**:
```javascript
socket.on('chat_closed', (data) => {
  addMessage('La chat è stata chiusa. Grazie per averci contattato!', 'system');
  isOperatorMode = false;

  // ✅ ADD THIS:
  setInputState(false);  // Disable input and send button
  input.placeholder = 'Chat chiusa';

  // Optional: Show "New Chat" button
  showSmartActions([{
    icon: '💬',
    text: 'Inizia nuova chat',
    description: 'Ricarica la pagina per una nuova conversazione',
    action: 'new_chat',
    type: 'primary'
  }]);
});

// Optional: Implement new_chat action
} else if (action.action === 'new_chat') {
  window.location.reload();
}
```

**Testing**:
1. Avviare chat con operatore
2. Operatore chiude chat da dashboard
3. Verificare input disabilitata nel widget
4. Verificare placeholder cambia
5. (Optional) Click "Nuova Chat" → page reload

**Details**: `docs/CHAT_FLOWS_ANALYSIS.md` - Bug #4

---

### 🟡 P2 - NICE TO HAVE (Post-Launch)

#### P2.1 - Widget Settings Cache Busting
**Effort**: 1-2 ore

Modifiche widget settings potrebbero non riflettersi immediatamente. Aggiungere versioning/cache busting.

#### P2.2 - Settings UI Tabs Organization
**Effort**: 2-3 ore

Settings page troppo lunga. Organizzare in tabs:
- AI Settings
- Widget Settings
- Integrations (Twilio, SMTP)
- Notifications

#### P2.3 - Test Connection Buttons
**Effort**: 1-2 ore

Aggiungere buttons "Test Connection" per:
- SMTP settings
- Twilio settings
- OpenAI API

#### P2.4 - Bulk Actions Chat Management
**Effort**: 3-4 ore

Checkbox selection + toolbar per azioni bulk:
- Archive multiple chats
- Close multiple chats
- Export multiple chats

---

## Workflow di Lavoro

### Per Fix Widget (lucine-minimal)

```bash
# 1. Navigate to widget repo
cd /Users/brnobtt/Desktop/lucine-minimal

# 2. Check status
git status

# 3. Edit file
# snippets/chatbot-popup.liquid

# 4. Commit (first time - see P0.5)
git commit -m "Fix: [description]"

# 5. Push
git push origin main

# 6. Deploy to Shopify
# Manual: Shopify Admin > Themes > Edit Code
# Copy/paste chatbot-popup.liquid
# OR use Shopify CLI (if configured)
```

### Per Fix Backend (lucine-production/backend)

```bash
# 1. Navigate to backend
cd /Users/brnobtt/Desktop/lucine-production/backend

# 2. Edit files
# src/controllers/*.js
# src/services/*.js

# 3. Test locally (optional)
npm run dev

# 4. Commit
git add .
git commit -m "Fix: [description]"

# 5. Push
git push origin main

# 6. Render auto-deploys!
# Check: https://dashboard.render.com/
# Service: chatbot-lucy-2025
```

### Per Fix Dashboard (lucine-production/src)

```bash
# 1. Navigate to project root
cd /Users/brnobtt/Desktop/lucine-production

# 2. Edit files
# src/pages/*.tsx
# src/components/dashboard/*.tsx

# 3. Test locally (optional)
npm run dev

# 4. Commit
git add .
git commit -m "Fix: [description]"

# 5. Push
git push origin main

# 6. Render auto-deploys!
# Check: https://dashboard.render.com/
# Service: lucine-dashboard
```

### Testing Workflow

```bash
# Test backend API
curl https://chatbot-lucy-2025.onrender.com/api/settings/public

# Test widget on site
# 1. Open: https://www.lucinedinatale.it/?chatbot=test
# 2. Check console for logs
# 3. Try chat flows

# Test dashboard
# Open: https://dashboard.lucine.it (or Render URL)
# Login with operator credentials
```

---

## Comandi Utili

### Git Operations

```bash
# Check status
git status
git log --oneline -5

# Create commit
git add .
git commit -m "Your message"

# Push
git push origin main

# Pull latest
git pull origin main

# Check remote
git remote -v

# View diff
git diff
git diff --staged
```

### Backend Operations

```bash
cd /Users/brnobtt/Desktop/lucine-production/backend

# Install dependencies
npm install

# Run locally (dev mode)
npm run dev

# Database migrations
npx prisma migrate dev
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# View database
npx prisma studio

# Seed database (if seed script exists)
npx prisma db seed
```

### Dashboard Operations

```bash
cd /Users/brnobtt/Desktop/lucine-production

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

### Database Operations

```bash
# Connect to Render database (need connection string from Render dashboard)
psql "postgresql://user:pass@host/database?sslmode=require"

# Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

# View tables
\dt

# View specific table
SELECT * FROM "KnowledgeItem" LIMIT 5;

# Check embeddings
SELECT id, question, length(embedding) FROM "KnowledgeItem" WHERE embedding IS NOT NULL LIMIT 5;
```

### Debugging

```bash
# Backend logs (Render)
# Go to Render Dashboard > chatbot-lucy-2025 > Logs

# Check if services are running
curl https://chatbot-lucy-2025.onrender.com/health
curl https://dashboard.lucine.it/

# Test API endpoint
curl -X POST https://chatbot-lucy-2025.onrender.com/api/chat/session \
  -H "Content-Type: application/json" \
  -d '{"userName":"Test"}'

# Check widget settings
curl https://chatbot-lucy-2025.onrender.com/api/settings/public | python3 -m json.tool
```

---

## Documentazione Esistente

### Docs da Leggere PRIMA di Iniziare

1. **`CHAT_FLOWS_ANALYSIS.md`** - Capire tutti i flussi chat e bugs
2. **`CURRENT_STATUS.md`** - Stato attuale del progetto
3. **`ROADMAP.md`** - Cosa va fixato e priorità

### Docs di Riferimento

4. **`IMPLEMENTATION_SUMMARY.md`** - Overview completo sistema
5. **`TESTING_GUIDE.md`** - Come testare
6. **`SEMANTIC_SEARCH_DEPLOYMENT.md`** - Come funziona pgvector

### Docs Deployment

7. **`RENDER_DEPLOYMENT.md`** - Setup Render services

---

## Deployment

### Servizi Render.com

| Service | Type | URL | Auto-Deploy | Environment |
|---------|------|-----|-------------|-------------|
| **chatbot-lucy-2025** | Web Service (Backend) | `https://chatbot-lucy-2025.onrender.com` | ✅ Yes (main branch) | Node 20 |
| **lucine-dashboard** | Static Site (Frontend) | `https://lucine-dashboard.onrender.com` | ✅ Yes (main branch) | Vite build |
| **lucine-chatbot-db** | PostgreSQL 15 | Internal | N/A | pgvector enabled |

### Environment Variables (Backend)

**Location**: Render Dashboard > chatbot-lucy-2025 > Environment

**Required**:
```bash
# Database
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=500

# Knowledge Base
KB_CONFIDENCE_THRESHOLD=0.7

# CORS
FRONTEND_URL=https://lucine-dashboard.onrender.com
SHOPIFY_SITE_URL=https://www.lucinedinatale.it

# JWT
JWT_SECRET=your-secret-here

# Optional: Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+...

# Optional: SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM_EMAIL=noreply@lucinedinatale.it
SMTP_FROM_NAME=Lucine di Natale
```

### Deploy Process

**Backend + Dashboard** (lucine-production):
1. Push to GitHub `main` branch
2. Render auto-detects changes
3. Builds and deploys automatically
4. Check logs in Render dashboard

**Widget** (lucine-minimal):
1. Push to GitHub (dopo fix P0.5!)
2. ❌ NO auto-deploy to Shopify
3. Manual: Copy `chatbot-popup.liquid` to Shopify Admin

---

## Document Maintenance & Update Workflow

### 📚 Document Relationships

I documenti nel progetto sono **interconnessi** e devono rimanere sincronizzati. Ecco la mappa delle relazioni:

```
PROJECT_ONBOARDING.md (MASTER)
    ├─► CHAT_FLOWS_ANALYSIS.md (Bug details)
    ├─► ROADMAP.md (Tasks & priorities)
    ├─► CURRENT_STATUS.md (Current work)
    ├─► IMPLEMENTATION_SUMMARY.md (System overview)
    └─► TESTING_GUIDE.md (QA procedures)
```

#### Document Hierarchy

| Document | Scopo | Update Frequency | Owner |
|----------|-------|------------------|-------|
| **PROJECT_ONBOARDING.md** | Master reference, entry point | Quando cambia architettura | AI/Dev |
| **CURRENT_STATUS.md** | Stato attuale lavoro | **Ogni sessione** | AI/Dev |
| **ROADMAP.md** | Task list, priorità | Quando fix completati/nuovi bug | AI/Dev |
| **CHAT_FLOWS_ANALYSIS.md** | Bug analysis, flows | Quando trovati nuovi bugs | AI |
| **IMPLEMENTATION_SUMMARY.md** | System overview | Quando cambia architettura | Dev |
| **TESTING_GUIDE.md** | QA procedures | Quando nuove feature | Dev |

---

### 🔄 Update Workflow

#### Quando Completi un Fix

**SEMPRE aggiorna questi documenti nell'ordine**:

1. **ROADMAP.md** - Cambia status del fix da `❌ DA FIXARE` a `✅ COMPLETATO`
   ```markdown
   ### ✅ P0.3 - Widget No Ticket Action [COMPLETATO - 27/10/2025]
   - **Status**: ✅ **COMPLETATO** (commit abc123)
   - **Issue**: [descrizione]
   - **Fix Applicato**: [cosa hai fatto]
   - **Testing**: [risultati test]
   ```

2. **CURRENT_STATUS.md** - Aggiungi nella sezione "Lavori Completati in Questa Sessione"
   ```markdown
   #### N. ✅ Fix PX.Y - [Nome Fix] (Commit: abc123)
   **Data**: 27 Ottobre 2025
   **Files Modificati**:
   - path/to/file.js (lines X-Y)

   **Problema**: [breve]
   **Fix**: [cosa fatto]
   **Testing**: [risultati]
   ```

3. **CURRENT_STATUS.md** - Aggiorna checklist se presente
   ```markdown
   - [x] Fix PX.Y completato
   - [x] Testing eseguito
   - [ ] Deploy verificato
   ```

#### Quando Trovi un Nuovo Bug

**SEMPRE crea/aggiorna questi documenti nell'ordine**:

1. **CHAT_FLOWS_ANALYSIS.md** - Aggiungi nuovo bug nella sezione "Bugs Critici Identificati"
   ```markdown
   ### 🔴 BUG #N: [Nome Bug]
   **File**: `path/to/file.js:line`
   **Problema**: [descrizione dettagliata]
   **Impact**: 🔴/🟠/🟡 + descrizione
   **Attuale comportamento**: [cosa succede ora]
   **Fix Required**: [codice fix]
   ```

2. **ROADMAP.md** - Aggiungi nella sezione appropriata (P0/P1/P2)
   ```markdown
   ### ❌ PX.N - [Nome Bug] [NUOVO - 27/10]
   - **Status**: ❌ **DA FIXARE**
   - **Issue**: [descrizione]
   - **Impact**: [livello]
   - **Fix Required**: [riferimento a CHAT_FLOWS_ANALYSIS.md]
   - **File**: [path]
   - **Estimated Effort**: [tempo]
   - **Details**: Vedi `docs/CHAT_FLOWS_ANALYSIS.md` - Bug #N
   ```

3. **CURRENT_STATUS.md** - Aggiungi in sezione "Problemi Identificati" o crea nuova
   ```markdown
   ### 🔴 Nuovo Bug Identificato: PX.N
   **Status**: ❌ DA FIXARE
   **Impact**: [livello]
   **Problema**: [breve descrizione]
   **Fix**: Vedi ROADMAP.md PX.N
   ```

#### Quando Inizi una Nuova Sessione di Lavoro

**SEMPRE aggiorna CURRENT_STATUS.md**:

1. Cambia data e ora in header:
   ```markdown
   **Ultimo aggiornamento**: 27 Ottobre 2025, ore 18:30
   ```

2. Aggiungi nuova sezione "Sessione Corrente":
   ```markdown
   ## 🎯 Sessione Corrente: [Nome Task]

   **Obiettivo**: [cosa vuoi fare]
   **Tasks da completare**:
   - [ ] Task 1
   - [ ] Task 2
   ```

3. Aggiorna "Status Generale" e "Next Action" in fondo

#### Quando Deploy in Production

**SEMPRE aggiorna questi documenti**:

1. **CURRENT_STATUS.md** - Aggiungi in "Lavori Completati"
   ```markdown
   #### Deploy Production (Commit: abc123)
   **Data**: 27 Ottobre 2025
   **Services Deployed**:
   - ✅ Backend (Render auto-deploy)
   - ✅ Dashboard (Render auto-deploy)
   - ⏳ Widget (deploy Shopify pending)

   **Verifiche Post-Deploy**:
   - [x] Backend health check OK
   - [x] API endpoints rispondono
   - [ ] Widget test su site
   ```

2. **ROADMAP.md** - Aggiungi commit hash ai fix completati
   ```markdown
   ### ✅ P0.3 - Widget No Ticket Action [DEPLOYED]
   - **Deploy**: ✅ Production (commit abc123 - 27/10/2025)
   ```

---

### 📋 Document Update Checklists

#### ✅ Checklist: Fix Completato

Dopo aver completato un fix, segui questa checklist:

```markdown
Fix: PX.Y - [Nome]

CODICE:
- [ ] Codice modificato e testato
- [ ] Commit creato con messaggio chiaro
- [ ] Push a GitHub completato
- [ ] Deploy eseguito (o scheduled)

DOCUMENTAZIONE:
- [ ] ROADMAP.md: Status cambiato da ❌ a ✅
- [ ] ROADMAP.md: Aggiunto commit hash
- [ ] ROADMAP.md: Aggiunti dettagli fix applicato
- [ ] ROADMAP.md: Aggiunto testing result
- [ ] CURRENT_STATUS.md: Aggiunto in "Lavori Completati"
- [ ] CURRENT_STATUS.md: Aggiornata checklist (se presente)
- [ ] CURRENT_STATUS.md: Aggiornato "Status Generale"
- [ ] CHAT_FLOWS_ANALYSIS.md: Bug marcato come FIXED (se applicabile)

TESTING:
- [ ] Test manuali eseguiti
- [ ] Risultati documentati
- [ ] Edge cases verificati
```

#### 🐛 Checklist: Nuovo Bug Trovato

Quando identifichi un nuovo bug:

```markdown
Bug: [Nome Bug]

ANALISI:
- [ ] Bug replicato e confermato
- [ ] Impact valutato (P0/P1/P2)
- [ ] File e line numbers identificati
- [ ] Root cause compreso

DOCUMENTAZIONE:
- [ ] CHAT_FLOWS_ANALYSIS.md: Nuovo bug aggiunto
- [ ] CHAT_FLOWS_ANALYSIS.md: Scenario completo documentato
- [ ] CHAT_FLOWS_ANALYSIS.md: Fix proposto con codice
- [ ] ROADMAP.md: Nuovo task PX.N creato
- [ ] ROADMAP.md: Priority assegnata (P0/P1/P2)
- [ ] ROADMAP.md: Effort stimato
- [ ] ROADMAP.md: Link a CHAT_FLOWS_ANALYSIS.md
- [ ] CURRENT_STATUS.md: Bug aggiunto in sezione appropriata

COMUNICAZIONE:
- [ ] User informato del bug
- [ ] Priority discussa
- [ ] Fix timeline concordata
```

#### 📝 Checklist: Inizio Sessione

All'inizio di ogni sessione di lavoro:

```markdown
SETUP:
- [ ] CURRENT_STATUS.md: Data/ora aggiornata
- [ ] CURRENT_STATUS.md: Nuova sezione "Sessione Corrente"
- [ ] CURRENT_STATUS.md: Obiettivi chiari
- [ ] ROADMAP.md: Letto e priorità comprese
- [ ] CHAT_FLOWS_ANALYSIS.md: Bugs da fixare compresi (se applicabile)

PLANNING:
- [ ] Task scelto (PX.Y)
- [ ] File da modificare identificati
- [ ] Testing plan preparato
- [ ] Tempo stimato
```

#### 🚀 Checklist: Deploy Completato

Dopo ogni deploy:

```markdown
Deploy: [Backend/Dashboard/Widget]

DEPLOY:
- [ ] Commit pushed
- [ ] Render auto-deploy completato (o Shopify manual)
- [ ] Services status: Live
- [ ] Logs checked: no errors

TESTING POST-DEPLOY:
- [ ] Health check OK
- [ ] API endpoints testati
- [ ] UI verificata (se frontend)
- [ ] Integration test (widget ↔ backend)
- [ ] User flows testati

DOCUMENTAZIONE:
- [ ] CURRENT_STATUS.md: Deploy documentato
- [ ] CURRENT_STATUS.md: Testing results aggiunti
- [ ] ROADMAP.md: Tasks deployati marcati [DEPLOYED]
- [ ] ROADMAP.md: Commit hash aggiunto

CLEANUP:
- [ ] CURRENT_STATUS.md: "Status Generale" aggiornato
- [ ] CURRENT_STATUS.md: "Next Action" aggiornato
```

---

### 🔧 Document Templates

#### Template: New Bug Entry (CHAT_FLOWS_ANALYSIS.md)

```markdown
### 🔴 BUG #N: [Breve Nome Descrittivo]

**File**: `path/to/file.js:lineNumber`

**Problema**:
[Descrizione dettagliata del problema. Cosa succede attualmente.]

**Impact**: 🔴 CRITICO / 🟠 ALTO / 🟡 MEDIO
**User Experience**: [Come affetta l'utente]

**Attuale Comportamento**:
```javascript
// Current code that's broken
```

**Fix Required**:
```javascript
// Proposed fix code
```

**Testing**:
1. [Step 1]
2. [Step 2]
3. Verificare [expected result]

**Details**: [Qualsiasi altra info rilevante]
```

#### Template: New Task (ROADMAP.md)

```markdown
### ❌ PX.N - [Nome Task] [NUOVO - DD/MM/YYYY]
- **Status**: ❌ **DA FIXARE**
- **Issue**: [Descrizione problema in 1-2 righe]
- **Impact**: 🔴/🟠/🟡 + descrizione impact
- **Behavior Attuale**:
  - [Cosa succede ora]
  - [Perché è un problema]
- **Fix Required**:
  ```javascript
  // Code fix or description
  ```
- **File**: `path/to/file.js:line`
- **Estimated Effort**: X minuti/ore
- **Details**: Vedi `docs/DOCUMENT.md` - Section

**Testing Steps**:
1. [Test step 1]
2. [Test step 2]
3. [Expected result]
```

#### Template: Completed Work (CURRENT_STATUS.md)

```markdown
#### N. ✅ Fix PX.Y - [Nome] (Commit: abc123)
**Data**: DD Mese YYYY
**Repository**: lucine-production / lucine-minimal
**Branch**: main

**Files Modificati**:
1. `path/to/file1.js` (lines X-Y)
2. `path/to/file2.tsx` (lines A-B)

**Problema Risolto**:
[Descrizione del problema che è stato fixato]

**Soluzione Implementata**:
[Cosa hai fatto per fixarlo]

**Testing Eseguito**:
- [x] Test case 1: [result]
- [x] Test case 2: [result]
- [x] Edge case: [result]

**Deploy**:
- ✅ Pushed to GitHub (commit abc123)
- ✅ Render auto-deployed
- ✅ Production verified

**Impact**:
[Come questo fix migliora il sistema]
```

---

### 🎯 Best Practices

#### DO ✅

1. **Aggiorna documenti SUBITO dopo ogni cambiamento**
   - Non aspettare fine sessione
   - Documenta mentre lavori

2. **Usa format consistente**
   - Segui i template forniti
   - Mantieni stile uniforme

3. **Linki cross-document**
   - `Vedi docs/FILE.md - Section`
   - `Details: ROADMAP.md PX.Y`

4. **Status icon chiari**
   - ✅ Completato
   - ❌ Da fare
   - 🔄 In progress
   - ⏳ Waiting/Pending
   - 🔴🟠🟡 Priority levels

5. **Date sempre presenti**
   - `DD Mese YYYY` format
   - Timezone: CET (Italia)

6. **Commit hash nei fix completati**
   - Tracciabilità
   - Facile trovare modifiche

#### DON'T ❌

1. **Non modificare vecchie entry**
   - Aggiungi nuove, non cambiare storiche
   - Mantieni cronologia

2. **Non cancellare bugs risolti**
   - Cambia status a ✅
   - Mantieni per reference

3. **Non assumere altri leggano tutto**
   - Ogni documento deve essere self-contained
   - Linki per approfondimenti

4. **Non usare linguaggio vago**
   - "Forse", "Potrebbe", "Circa"
   - Usa fatti: "Succede quando...", "Fix in line X"

5. **Non lasciare documenti out-of-sync**
   - Se cambi ROADMAP, aggiorna CURRENT_STATUS
   - Se trovi bug, aggiorna TUTTI e 3: CHAT_FLOWS + ROADMAP + CURRENT

---

### 🔍 Document Verification

#### Prima di Commit, Verifica:

```bash
# Quick check documents are in sync
cd /Users/brnobtt/Desktop/lucine-production/docs

# Check all P0/P1 tasks in ROADMAP have corresponding entry in CHAT_FLOWS (if bugs)
grep -n "### ❌ P0\\|### ❌ P1" ROADMAP.md
grep -n "### 🔴 BUG\\|### 🟠 BUG" CHAT_FLOWS_ANALYSIS.md

# Check CURRENT_STATUS last update date is today
head -5 CURRENT_STATUS.md

# Check all completed fixes in ROADMAP have commit hash
grep -n "✅.*COMPLETATO" ROADMAP.md | grep -v "commit"  # Should be empty
```

#### Periodic Maintenance (Weekly)

1. **Review CURRENT_STATUS.md**
   - Archivia vecchie sessioni
   - Mantieni solo ultime 2-3 settimane

2. **Review ROADMAP.md**
   - Verifica P0/P1 ancora rilevanti
   - Aggiorna effort estimates se necessario

3. **Review CHAT_FLOWS_ANALYSIS.md**
   - Aggiungi nuovi scenari se sistema cambiato
   - Aggiorna status bugs (✅/❌)

---

### 📊 Document Sync Matrix

Quando modifichi un elemento, aggiorna questi documenti:

| Azione | ONBOARDING | ROADMAP | CURRENT | FLOWS | IMPL | TESTING |
|--------|-----------|---------|---------|-------|------|---------|
| **Nuovo Bug** | - | ✅ Aggiungi task | ✅ Nota | ✅ Dettagli | - | ✅ Test case |
| **Fix Completato** | - | ✅ Status→✅ | ✅ Completo | ✅ Status→✅ | - | ✅ Update |
| **Deploy** | - | ✅ [DEPLOYED] | ✅ Deploy log | - | - | - |
| **Nuova Feature** | ⚠️ Se arch | ✅ Task | ✅ Work log | ⚠️ Se flows | ✅ Update | ✅ Aggiungi |
| **Arch Change** | ✅ Update | - | ✅ Nota | ⚠️ Se flows | ✅ Update | - |
| **Config Change** | ✅ Update | - | ✅ Nota | - | ⚠️ Se major | - |

Legend:
- ✅ = Always update
- ⚠️ = Update if applicable
- `-` = No update needed

---

## Quick Start Checklist per AI

Quando inizi a lavorare, segui questi passi:

### 1. Orientamento (5 min)
- [ ] Leggi questo file `PROJECT_ONBOARDING.md` (SEI QUI!)
- [ ] Leggi `CHAT_FLOWS_ANALYSIS.md` per capire bugs
- [ ] Leggi `ROADMAP.md` per priorità

### 2. Setup Working Directory (1 min)
```bash
# Check you're in the right place
pwd
# Should see: /Users/brnobtt/Desktop/lucine-minimal OR lucine-production

# Check git status
git status
git remote -v
```

### 3. Identify Task (2 min)
- [ ] Che problema sto risolvendo? (P0.3, P0.4, P1.6, P1.7, altro?)
- [ ] Quale file devo modificare?
- [ ] Quale repository? (lucine-minimal o lucine-production?)

### 4. Make Changes (variable)
- [ ] Leggi file esistente con Read tool
- [ ] Analizza codice
- [ ] Applica fix con Edit tool
- [ ] Verifica modifiche

### 5. Update Documentation (5 min) ⚠️ IMPORTANTE!
- [ ] **ROADMAP.md**: Aggiorna status fix (❌ → ✅)
- [ ] **ROADMAP.md**: Aggiungi commit hash
- [ ] **CURRENT_STATUS.md**: Aggiungi in "Lavori Completati"
- [ ] **CURRENT_STATUS.md**: Aggiorna checklist
- [ ] **CHAT_FLOWS_ANALYSIS.md**: Marca bug come FIXED (se applicabile)
- [ ] Vedi sezione "Document Maintenance" per dettagli

### 6. Commit & Push (2 min)
- [ ] `git add .`
- [ ] `git commit -m "Fix: [description]"`
- [ ] `git push origin main`
- [ ] Se lucine-minimal: PRIMA fare commit iniziale (P0.5)!

### 7. Deploy & Test (5-10 min)
- [ ] Backend/Dashboard: check Render logs
- [ ] Widget: deploy manualmente su Shopify
- [ ] Test endpoint/UI
- [ ] Verify fix works

### 8. Final Documentation Update (2 min)
- [ ] **ROADMAP.md**: Aggiungi [DEPLOYED] se deploy OK
- [ ] **CURRENT_STATUS.md**: Documenta risultati deploy
- [ ] **CURRENT_STATUS.md**: Aggiorna "Status Generale" e "Next Action"

---

## Priority Tasks for Immediate Start

**Se devi iniziare ORA, fai in ordine**:

### Task 1: Fix lucine-minimal Git (P0.5)
**Effort**: 2 min
**File**: N/A (git commands)
**Details**: Vedi P0.5 sopra

### Task 2: Fix Widget Ticket Actions (P0.3 + P0.4)
**Effort**: 15 min
**File**: `lucine-minimal/snippets/chatbot-popup.liquid`
**Lines**: 992-995 (P0.3), 1207 (P0.4)
**Details**: Vedi P0.3 e P0.4 sopra

### Task 3: Test Widget Ticket Flow End-to-End
**Effort**: 10 min
**Details**: Follow testing steps in P0.3 and P0.4

### Task 4 (Optional): Dashboard Notifications (P1.6)
**Effort**: 2-3 hours
**Files**: Multiple dashboard components
**Details**: Vedi P1.6 sopra

---

## Domande Frequenti

### Q: Quale repository devo modificare?
**A**: Dipende dal file:
- Widget → `lucine-minimal`
- Backend API → `lucine-production/backend`
- Dashboard → `lucine-production/src`

### Q: Come testo le modifiche?
**A**:
- Backend: curl API endpoint o npm run dev
- Dashboard: npm run dev e apri localhost
- Widget: Devi deployare su Shopify, poi testare su sito

### Q: lucine-minimal non ha commit, è normale?
**A**: ❌ NO! È P0.5 bug. Devi creare commit iniziale (vedi P0.5).

### Q: Dove trovo le credenziali?
**A**:
- Render: dashboard.render.com (chiedere login)
- Shopify: admin.shopify.com (chiedere login)
- Database: Render dashboard > lucine-chatbot-db > Connection String

### Q: Come accedo al database?
**A**:
1. Render Dashboard > lucine-chatbot-db
2. Copy "External Connection String"
3. `psql "postgresql://..."`
4. Oppure: `npx prisma studio` da backend/

### Q: Il backend non risponde, cosa faccio?
**A**:
1. Check Render logs: dashboard.render.com > chatbot-lucy-2025 > Logs
2. Check service status: should be "Live"
3. Test: `curl https://chatbot-lucy-2025.onrender.com/health`
4. Se tutto OK ma non risponde: potrebbe essere cold start (attendi 30s)

### Q: Modifico il widget ma non vedo cambiamenti?
**A**: Hai deployato su Shopify? Widget changes richiedono:
1. Commit + push (lucine-minimal)
2. Manual copy to Shopify Admin
3. Hard refresh browser (Cmd+Shift+R)

---

## Contatti & Resources

### GitHub Repositories
- Backend+Dashboard: `https://github.com/mujians/lucine-production.git`
- Widget: `https://github.com/mujians/lucine25minimal.git`

### Deployment
- Render: `https://dashboard.render.com/`
- Shopify: `https://admin.shopify.com/`

### Live URLs
- Website: `https://www.lucinedinatale.it/`
- Widget Test: `https://www.lucinedinatale.it/?chatbot=test`
- Backend API: `https://chatbot-lucy-2025.onrender.com`
- Dashboard: `https://lucine-dashboard.onrender.com` (or custom domain)

### Documentation
- This file: `docs/PROJECT_ONBOARDING.md`
- All docs: `docs/` folder

---

**Last Updated**: 27 Ottobre 2025
**Version**: 1.0
**Status**: Ready for AI onboarding

---

## 🎯 TL;DR per AI in Fretta

**Cosa fare ORA**:
1. Leggi `CHAT_FLOWS_ANALYSIS.md` per capire bugs
2. Fix P0.5: Commit lucine-minimal (2 min)
3. Fix P0.3 + P0.4: Widget ticket actions (15 min)
4. Test end-to-end ticket flow (10 min)
5. ⚠️ **AGGIORNA DOCS** dopo ogni fix (vedi "Document Maintenance" section)

**File chiave**:
- Widget: `lucine-minimal/snippets/chatbot-popup.liquid`
- Backend: `lucine-production/backend/src/`
- Dashboard: `lucine-production/src/`
- Docs: `lucine-production/docs/`

**Comandi base**:
```bash
cd /Users/brnobtt/Desktop/lucine-minimal   # Per widget
cd /Users/brnobtt/Desktop/lucine-production # Per backend/dashboard
git status
git add . && git commit -m "Fix: [cosa]" && git push origin main
```

**Deploy**:
- Backend+Dashboard: auto su Render dopo push
- Widget: manuale su Shopify Admin

Buon lavoro! 🚀
