# Lucine Chatbot - Riepilogo Implementazione

**Data ultimo aggiornamento**: 26 Ottobre 2025
**Versione**: 2.0

## Indice

1. [Panoramica Sistema](#panoramica-sistema)
2. [Funzionalità Implementate](#funzionalità-implementate)
3. [Dashboard Operatore](#dashboard-operatore)
4. [Widget Chat](#widget-chat)
5. [Configurazione Sistema](#configurazione-sistema)
6. [Integrazioni](#integrazioni)
7. [Database](#database)
8. [Deploy](#deploy)

---

## Panoramica Sistema

Lucine è un sistema di chat assistita da AI con supporto operatore umano per Lucine di Natale. Il sistema combina:
- **AI (GPT-4)** con RAG (Retrieval Augmented Generation) per risposte automatiche
- **Knowledge Base** per risposte accurate basate su Q&A predefinite
- **Operatori Umani** per assistenza diretta quando necessario
- **Ticketing** per richieste che richiedono follow-up
- **Analytics** per monitorare performance e qualità del servizio

### Stack Tecnologico

**Frontend Dashboard**:
- React 18 + TypeScript + Vite
- TailwindCSS + shadcn/ui
- React Router v6
- Socket.IO Client

**Backend**:
- Node.js + Express
- Prisma ORM + PostgreSQL
- Socket.IO Server
- OpenAI API

**Deploy**:
- Render.com (automatic deployment da GitHub)
- Database PostgreSQL su Render

---

## Funzionalità Implementate

### ✅ Dashboard Operatore

#### 1. Gestione Chat
- **Chat List** con filtri avanzati:
  - Stato: ACTIVE, WITH_OPERATOR, CLOSED
  - Operatore assegnato
  - Data range
  - Search in nome utente e messaggi
  - Flag important
  - Archive status
- **Chat Window** con:
  - Visualizzazione messaggi in tempo reale
  - Indicatore typing
  - Risposte rapide (Canned Responses) con shortcut `/`
  - Chiusura chat con notifica all'utente
  - Transfer chat ad altro operatore
  - Flag/Unflag chat
  - Archive/Unarchive chat
- **WebSocket Real-time**:
  - Notifiche nuove chat
  - Messaggi in tempo reale
  - Aggiornamenti stato chat
  - Notifiche transfer/flag/archive

#### 2. Gestione Ticket
- **Ticket List** con filtri:
  - Stato: OPEN, IN_PROGRESS, RESOLVED, CLOSED
  - Priorità: LOW, MEDIUM, HIGH, URGENT
  - Data range
  - Search in oggetto e descrizione
- **Ticket Window**:
  - Dettagli ticket completi
  - Timeline eventi
  - Cambio stato
  - Cambio priorità (dropdown)
  - Assegnazione operatore
  - Note interne

#### 3. Gestione Operatori
- **Operator Manager**:
  - Creazione/modifica/eliminazione operatori
  - Gestione ruoli (ADMIN, OPERATOR, VIEWER)
  - Stato disponibilità (isAvailable toggle)
  - Reset password
  - Statistiche per operatore

#### 4. Knowledge Base
- **Knowledge Manager**:
  - CRUD Q&A items
  - Categorie per organizzazione
  - Attivazione/disattivazione items
  - Embedding per semantic search (preparato per pgvector)
  - Accessibile da sidebar (icona BookOpen)

#### 5. Risposte Rapide (Canned Responses)
- **Canned Response Manager**:
  - CRUD risposte predefinite
  - Shortcut key per invio rapido
  - Categorie per organizzazione
  - Uso tramite `/` in chat window

#### 6. Analytics e Statistiche
- **Dashboard Analytics**:
  - Overview metriche principali
  - Chat totali per periodo
  - Ticket totali per periodo
  - Performance operatori
  - Tempi di risposta medi
  - Satisfaction rate
  - Grafici e visualizzazioni

#### 7. System Status
- **Monitoraggio Sistema**:
  - Stato servizi (Database, OpenAI, WebSocket)
  - Uptime e health checks
  - Performance metrics
  - Operatori online
  - Chat attive

#### 8. Impostazioni (Settings)
- **Configurazione Completa Sistema**:

  **AI Settings**:
  - OpenAI API Key
  - Model selection (gpt-4, gpt-3.5-turbo)
  - Temperature
  - Confidence threshold
  - **AI System Prompt** (textarea editabile, caricato dinamicamente da database)

  **Widget Colors** (8 impostazioni):
  - Header Color
  - User Balloon Color
  - Operator Balloon Color
  - AI Balloon Color
  - Send Button Color
  - Background Color
  - Input Background Color
  - Text Color

  **Widget Layout**:
  - Position (left/right)
  - Widget Title
  - Widget Subtitle

  **Widget Messages - Initial**:
  - Greeting Message
  - Input Placeholder

  **Widget Messages - System**:
  - Operator Joined Message
  - Operator Left Message
  - Chat Closed Message
  - Typing Indicator Text

  **Widget Messages - Actions**:
  - Request Operator Prompt
  - No Operator Available Message
  - Ticket Created Confirmation

  **Widget Messages - Ticket Form**:
  - Form Title
  - Form Description
  - Contact Method Label
  - WhatsApp Label
  - Email Label
  - Message Label
  - Submit Button Text
  - Cancel Button Text

  **WhatsApp Integration**:
  - Twilio Account SID
  - Twilio Auth Token
  - WhatsApp Number

  **Email Integration**:
  - SMTP Host
  - SMTP Port
  - SMTP User
  - SMTP Password
  - Email From Address

### ✅ Widget Chat (Shopify Integration)

#### Funzionalità Widget
- **Chat Interface**:
  - Apertura/chiusura widget
  - Invio messaggi utente
  - Ricezione risposte AI con RAG
  - Connessione operatore umano
  - Visualizzazione typing indicator
  - Notifiche chat chiusa
- **Request Operator**:
  - Richiesta manuale utente
  - Auto-suggest quando AI ha bassa confidence
  - Auto-assign a operatore meno occupato
  - Fallback a ticket se nessuno disponibile
- **Ticket Creation**:
  - Form ticket integrato nel widget
  - Contatto via WhatsApp o Email
  - Invio automatico dati
- **WebSocket Real-time**:
  - Connessione al join chat room
  - Ricezione messaggi in tempo reale
  - Disconnect al close widget

---

## Dashboard Operatore

### Autenticazione
- Login con email/password
- Session-based auth
- Protected routes
- Auto-redirect se non autenticato

### Sidebar Navigation
- **Chat** (/) - Gestione conversazioni
- **Tickets** (/tickets) - Gestione ticket
- **Operatori** (/operators) - Gestione team
- **Statistiche** (/analytics) - Metriche e report
- **Risposte Rapide** (/canned-responses) - Messaggi predefiniti
- **Knowledge Base** (/knowledge) - Q&A management
- **System Status** (/system-status) - Monitoraggio sistema
- **Impostazioni** (/settings) - Configurazione

### Features Trasversali
- **Real-time Updates**: Tutte le liste si aggiornano via WebSocket
- **Search & Filter**: Ogni lista ha filtri avanzati
- **Responsive**: Layout ottimizzato per desktop
- **Dark Theme**: Design con palette scura coerente

---

## Widget Chat

### Integrazione Shopify
Il widget è integrato tramite file Liquid:
```liquid
{% render 'chatbot-popup' %}
```

### Configurazione Widget
Tutte le impostazioni sono modificabili da Dashboard > Impostazioni:
- Colori header, balloons, buttons, sfondo
- Posizione (left/right)
- Titolo e sottotitolo
- Tutti i messaggi mostrati all'utente
- Tutti i label e testi del form ticket

**NOTA**: Attualmente i colori e messaggi sono hardcoded nel file Liquid. Per applicare le impostazioni del database, il widget deve essere modificato per:
1. Fetch settings da API `/api/settings/public`
2. Applicare colori via CSS custom properties
3. Sostituire messaggi hardcoded con quelli da database

---

## Configurazione Sistema

### AI Configuration (Settings Page)

#### System Prompt Dinamico
Il prompt base dell'AI è configurabile da Dashboard:
- Campo textarea in Settings > AI Settings
- Caricato dinamicamente da database (`SystemSettings.aiSystemPrompt`)
- Fallback a default se non trovato
- Default: "Sei Lucy, l'assistente virtuale di Lucine di Natale..."

#### Rilevamento Richieste Operatore
L'AI ha istruzioni built-in per:
- Rilevare richieste esplicite di operatore umano
- Suggerire operatore in caso di incertezza
- Rispondere "Ti metto in contatto con un operatore!" quando appropriato

#### Knowledge Base Integration (RAG)
Per ogni messaggio utente:
1. Generate embedding del messaggio
2. Search top 3 Q&A items rilevanti (attualmente text search, preparato per pgvector)
3. Includi risultati nel context dell'AI
4. AI usa knowledge base per dare risposte precise
5. Confidence score aumenta se ha KB results

#### Confidence Threshold
- Soglia configurabile in Settings
- Se confidence < threshold → suggest operator
- Se AI menziona operatore nel messaggio → suggest operator

### Database Configuration

Tutte le settings sono salvate in tabella `SystemSettings`:
```prisma
model SystemSettings {
  key       String @id
  value     String
  updatedAt DateTime @updatedAt
}
```

Settings vengono caricate via API:
- `GET /api/settings` - Get all settings (operators)
- `POST /api/settings` - Save all settings (operators)

---

## Integrazioni

### OpenAI API
- **Model**: Configurabile (gpt-4, gpt-3.5-turbo)
- **Embedding Model**: text-embedding-ada-002
- **Usage**:
  - Chat completions per risposte AI
  - Embeddings per semantic search KB

### Twilio WhatsApp (Preparato)
- Account SID, Auth Token, Phone Number configurabili
- Endpoint preparato per webhook WhatsApp
- Integrazione da completare

### SMTP Email (Preparato)
- Host, Port, User, Password configurabili
- Invio ticket via email da completare

### Socket.IO
**Rooms**:
- `dashboard` - Tutti gli operatori connessi
- `operator:{operatorId}` - Singolo operatore
- `chat:{sessionId}` - Singola chat session

**Events**:
- `new_chat_request` - Nuova chat assegnata a operatore
- `user_message` - Nuovo messaggio utente
- `operator_message` - Messaggio da operatore
- `new_message` - Messaggio generico
- `chat_closed` - Chat chiusa
- `chat_assigned` - Chat assegnata
- `chat_transferred` - Chat trasferita
- `chat_flagged/unflagged` - Chat flagged/unflagged
- `chat_archived/unarchived` - Chat archiviata/desarchiviata
- `chat_deleted` - Chat eliminata (soft delete)

---

## Database

### Schema Principale

#### ChatSession
```prisma
model ChatSession {
  id              String    @id @default(uuid())
  userName        String?
  status          String    // ACTIVE, WITH_OPERATOR, CLOSED
  messages        String    @db.Text // JSON array
  operatorId      String?
  operator        Operator? @relation(fields: [operatorId])
  lastMessageAt   DateTime  @default(now())
  createdAt       DateTime  @default(now())
  closedAt        DateTime?

  // Advanced features
  isArchived      Boolean   @default(false)
  archivedAt      DateTime?
  archivedBy      String?
  isFlagged       Boolean   @default(false)
  flagReason      String?
  flaggedBy       String?
  flaggedAt       DateTime?
  deletedAt       DateTime? // Soft delete
}
```

#### Ticket
```prisma
model Ticket {
  id              String    @id @default(uuid())
  subject         String
  description     String    @db.Text
  status          String    // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  priority        String    @default("MEDIUM") // LOW, MEDIUM, HIGH, URGENT
  contactMethod   String    // whatsapp, email
  contactValue    String
  operatorId      String?
  operator        Operator? @relation(fields: [operatorId])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  resolvedAt      DateTime?
  closedAt        DateTime?
}
```

#### Operator
```prisma
model Operator {
  id                  String    @id @default(uuid())
  email               String    @unique
  password            String
  name                String
  role                String    @default("OPERATOR") // ADMIN, OPERATOR, VIEWER
  isOnline            Boolean   @default(false)
  isAvailable         Boolean   @default(true) // New: disponibile a ricevere chat
  totalChatsHandled   Int       @default(0)
  createdAt           DateTime  @default(now())
  chatSessions        ChatSession[]
  tickets             Ticket[]
}
```

#### KnowledgeItem
```prisma
model KnowledgeItem {
  id          String    @id @default(uuid())
  question    String
  answer      String    @db.Text
  category    String?
  isActive    Boolean   @default(true)
  embedding   String?   @db.Text // JSON array, preparato per pgvector
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### CannedResponse
```prisma
model CannedResponse {
  id          String    @id @default(uuid())
  title       String
  content     String    @db.Text
  shortcut    String?   @unique
  category    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### SystemSettings
```prisma
model SystemSettings {
  key         String    @id
  value       String    @db.Text
  updatedAt   DateTime  @updatedAt
}
```

---

## Deploy

### Render.com Configuration

**Web Service**:
- Build Command: `npm install && npm run build`
- Start Command: `npm run start` (backend server)
- Environment: Node 18+

**Environment Variables**:
```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
JWT_SECRET=...
FRONTEND_URL=https://...
PORT=5000
NODE_ENV=production
```

**SPA Routing**:
- File `_redirects` nella build:
  ```
  /*    /index.html   200
  ```
- Risolve problema 404 su page refresh

### GitHub Integration
- Auto-deploy da push su branch `main`
- Build automatico su ogni commit
- Rollback disponibile da Render dashboard

### Database
- PostgreSQL managed by Render
- Automatic backups
- Connection pooling
- Migrations via Prisma

---

## Prossimi Passi (Opzionali)

### Widget Dynamic Configuration
Per completare la personalizzazione widget:
1. Creare endpoint pubblico `/api/settings/public` per widget
2. Modificare file Liquid per fetch settings
3. Applicare colori via CSS custom properties
4. Sostituire messaggi hardcoded con valori da database

### Database Optimization
1. Implementare pgvector per semantic search
2. Migrare da text search a similarity search
3. Ottimizzare query con indexes

### Integrazioni Complete
1. Completare integrazione Twilio WhatsApp
2. Implementare invio email SMTP
3. Aggiungere notifiche push per operatori

### Analytics Avanzate
1. Exportazione report (CSV, PDF)
2. Grafici interattivi avanzati
3. Dashboard personalizzabili per operatore

---

## Note Tecniche

### File Structure
```
lucine-production/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API endpoints
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic (OpenAI, DB)
│   │   ├── middleware/     # Auth, validation
│   │   ├── config/         # Configuration
│   │   └── server.js       # Entry point
│   └── prisma/
│       └── schema.prisma   # Database schema
├── src/
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── settings/       # Settings components
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Page components
│   ├── lib/                # Utils (axios, etc)
│   └── App.tsx             # React Router setup
├── docs/                   # Documentation
└── public/                 # Static assets
```

### Key Files Modified (Last Session)
1. `src/pages/Settings.tsx` - Expanded con 30+ nuove settings
2. `src/components/settings/SettingsSection.tsx` - Aggiunto supporto textarea
3. `backend/src/services/openai.service.js` - Caricamento prompt dinamico
4. `src/components/dashboard/OperatorSidebar.tsx` - Aggiunto link Knowledge Base

### Git Workflow
```bash
# Feature development
git add -A
git commit -m "feat: description"
git push origin main

# Render auto-deploys
```

---

**Ultimo aggiornamento**: 26 Ottobre 2025
**Maintained by**: Claude Code
