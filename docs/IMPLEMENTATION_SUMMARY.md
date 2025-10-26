# Lucine Chatbot - Riepilogo Implementazione

**Data ultimo aggiornamento**: 26 Ottobre 2025
**Versione**: 2.0

## Indice

1. [Struttura Progetto](#struttura-progetto)
2. [Panoramica Sistema](#panoramica-sistema)
3. [Funzionalità Implementate](#funzionalità-implementate)
4. [Dashboard Operatore](#dashboard-operatore)
5. [Widget Chat](#widget-chat)
6. [Configurazione Sistema](#configurazione-sistema)
7. [Integrazioni](#integrazioni)
8. [Database](#database)
9. [Deploy](#deploy)
10. [Linee Guida Sviluppo](#linee-guida-sviluppo)

---

## Struttura Progetto

### Cartelle sul Desktop

Il progetto è organizzato in **TRE cartelle** con funzioni diverse:

```
~/Desktop/
├── lucine-production/          # ⭐ DASHBOARD + BACKEND (GitHub + Render)
│   ├── backend/                # Backend Node.js + Prisma
│   ├── src/                    # Frontend React + TypeScript (Dashboard)
│   ├── docs/                   # Documentazione aggiornata
│   ├── public/                 # Asset statici
│   ├── .git/                   # Repository Git ATTIVO
│   └── README.md
│
├── lucine-minimal/             # ⭐ TEMA SHOPIFY (Widget in produzione)
│   ├── snippets/
│   │   └── chatbot-popup.liquid    # Widget chat attivo su Shopify
│   ├── assets/                 # CSS/JS tema
│   ├── .git/                   # Git separato (tema Shopify)
│   └── chatbot-backend/        # [Obsoleto - NON usare]
│
└── BACKUP-chatbot-lucy-2025-20251021/    # 💾 BACKUP (riferimento)
    ├── frontend-dashboard/     # Vecchia dashboard (codice di riferimento)
    ├── backend/                # Vecchio backend (codice di riferimento)
    └── *.md                    # Vecchia documentazione
```

### ⚠️ IMPORTANTE: Quale cartella usare per cosa

**Dashboard/Backend** → `/Users/brnobtt/Desktop/lucine-production/`
- Modifiche al dashboard operatore
- Modifiche alle API backend
- Modifiche al database (Prisma schema)
- **Git**: github.com/mujians/lucine-chatbot
- **Deploy**: Render.com (auto-deploy)

**Widget Shopify** → `/Users/brnobtt/Desktop/lucine-minimal/snippets/chatbot-popup.liquid`
- Modifiche al widget chat (UI, colori, messaggi)
- File attivo: `chatbot-popup.liquid` (42KB, ultima modifica 23 Ott)
- **Git**: Repository separato (tema Shopify)
- **Deploy**: Upload manuale su Shopify Admin

**Riferimento** → `/Users/brnobtt/Desktop/BACKUP-chatbot-lucy-2025-20251021/`
- Consultare codice vecchio se serve recuperare funzioni
- Vecchie migration Prisma
- NON modificare, solo leggere

### Connessioni Git e Deploy

```
DASHBOARD + BACKEND:
lucine-production/
    ↓ git push origin main
GitHub: github.com/mujians/lucine-chatbot
    ↓ auto-deploy webhook
Render.com: https://chatbot-lucy-2025.onrender.com
    ↓
Live Dashboard: https://chatbot-lucy-2025.onrender.com

WIDGET:
lucine-minimal/snippets/chatbot-popup.liquid
    ↓ manual upload
Shopify Admin > Online Store > Themes > Edit Code
    ↓
Live Widget: https://lucinedinatale.myshopify.com (embedded)
```

**Workflow Dashboard**:
1. Modifiche in `lucine-production/`
2. `git add -A && git commit -m "..." && git push origin main`
3. Render rileva push e fa auto-deploy (build automatico)
4. Dashboard live aggiornata in ~5-10 minuti

**Workflow Widget**:
1. Modifiche in `lucine-minimal/snippets/chatbot-popup.liquid`
2. Shopify Admin > Themes > Edit Code > Snippets > chatbot-popup.liquid
3. Copy/paste codice aggiornato
4. Save
5. Widget live aggiornato immediatamente

### Git Configuration

```bash
# Current repository
cd /Users/brnobtt/Desktop/lucine-production
git remote -v
# origin  https://github.com/mujians/lucine-chatbot.git (fetch)
# origin  https://github.com/mujians/lucine-chatbot.git (push)

# Branch principale
git branch
# * main  (branch attivo)
```

### File Importanti da Conoscere

**Backend**:
- `backend/src/server.js` - Entry point server
- `backend/src/controllers/` - API endpoints
- `backend/src/services/openai.service.js` - AI logic (prompt dinamico)
- `backend/prisma/schema.prisma` - Database schema

**Frontend**:
- `src/App.tsx` - React Router setup
- `src/pages/Settings.tsx` - Configurazione completa (30+ settings)
- `src/components/dashboard/` - Componenti dashboard
- `src/components/settings/SettingsSection.tsx` - Form component

**Documentazione**:
- `docs/IMPLEMENTATION_SUMMARY.md` - Questo documento
- `docs/TESTING_GUIDE.md` - Guida test completa
- `README.md` - Project README

**Deploy**:
- `public/_redirects` - SPA routing fix (Render)
- `package.json` - Scripts e dipendenze

### Database PostgreSQL

```
Database: PostgreSQL (hosted on Render)
Connection: Via DATABASE_URL environment variable
Access: Prisma ORM

Tabelle principali:
- ChatSession
- Ticket
- Operator
- KnowledgeItem
- CannedResponse
- SystemSettings
```

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

## Linee Guida Sviluppo

### 📝 REGOLA FONDAMENTALE: Aggiorna SEMPRE la Documentazione

**QUANDO modifichi codice, DEVI aggiornare i file .md**:

#### 1. Modifiche a Features o Configurazione
Se aggiungi/modifichi funzionalità dashboard, widget, settings, API:
- ✅ Aggiorna `docs/IMPLEMENTATION_SUMMARY.md`
- ✅ Aggiorna sezione specifica (es. "Dashboard Operatore", "Configurazione Sistema")
- ✅ Aggiungi nota in "Key Files Modified (Last Session)"
- ✅ Aggiorna data: "Ultimo aggiornamento"

**Esempio**:
```markdown
### Key Files Modified (Last Session)
1. src/pages/Settings.tsx - Expanded con 30+ nuove settings
2. backend/src/services/openai.service.js - Caricamento prompt dinamico
3. [NUOVO] src/components/chat/MessageBubble.tsx - Added emoji support
```

#### 2. Nuovi Test o Procedure
Se aggiungi nuove funzioni che richiedono testing:
- ✅ Aggiorna `docs/TESTING_GUIDE.md`
- ✅ Aggiungi checklist per nuova feature
- ✅ Specifica steps di testing

#### 3. Cambio Struttura Progetto
Se crei/sposti/elimini cartelle o file importanti:
- ✅ Aggiorna sezione "Struttura Progetto"
- ✅ Aggiorna "File Structure"
- ✅ Specifica motivo del cambio

#### 4. Modifiche Deploy o Git
Se cambi workflow, env variables, build process:
- ✅ Aggiorna sezione "Deploy"
- ✅ Aggiorna "Git Workflow"
- ✅ Documenta nuovi step

#### 5. Bug Fix Importanti
Se risolvi bug critici o ricorrenti:
- ✅ Aggiorna `docs/TESTING_GUIDE.md` con come testare fix
- ✅ Aggiungi nota in IMPLEMENTATION_SUMMARY se impatta architettura

### ⚠️ Files .md sul Desktop (Fuori da Git)

**File sul Desktop root** (`/Users/brnobtt/Desktop/*.md`):
- Questi NON sono versionati in Git
- Sono documentazione temporanea di sessioni passate
- Utili come riferimento ma possono essere obsoleti
- **Priorità**: Sempre usare `lucine-production/docs/*.md` come source of truth

**File .md vecchi trovati**:
```
DEPLOYMENT-GUIDE.md             (24 Ott - deploy dashboard)
SESSION-SUMMARY-FINAL.md        (24 Ott - sessione fix)
DASHBOARD-FUNCTIONAL-ANALYSIS.md
TESTING-CHECKLIST-COMPLETA.md
MISSING_FEATURES_ANALYSIS.md
ERRORI-E-FIX-RIEPILOGO.md
WIDGET-SETTINGS-INTEGRATION.md
DASHBOARD-ISSUES-ANALYSIS.md
TWILIO-WHATSAPP-SETUP.md
```

Questi possono essere utili per consultare storia problemi/fix, ma:
- ✅ Info rilevanti devono essere migrate in `docs/IMPLEMENTATION_SUMMARY.md`
- ✅ Poi possono essere archiviati o eliminati
- ❌ NON usarli come documentazione ufficiale

### 🎯 Checklist Pre-Commit

Prima di ogni commit, verifica:
- [ ] Codice modificato funziona (`npm run build` senza errori)
- [ ] `docs/IMPLEMENTATION_SUMMARY.md` aggiornato con modifiche
- [ ] `docs/TESTING_GUIDE.md` aggiornato se serve
- [ ] Data ultimo aggiornamento cambiata
- [ ] Commit message descrittivo con feature/fix
- [ ] Push a GitHub `origin/main`

### 📊 Standard Commit Messages

```bash
# Features
git commit -m "feat: add operator availability toggle"

# Bug fixes
git commit -m "fix: resolve 404 on page refresh"

# Documentation
git commit -m "docs: update widget integration guide"

# Configuration
git commit -m "config: add new environment variables"

# Refactoring
git commit -m "refactor: optimize chat message rendering"
```

### 🔄 Workflow Completo

```bash
# 1. Modifica codice
vim src/pages/Settings.tsx

# 2. Test locale
npm run build

# 3. Aggiorna documentazione
vim docs/IMPLEMENTATION_SUMMARY.md
# - Aggiungi modifica in sezione appropriata
# - Aggiorna "Key Files Modified"
# - Cambia data

# 4. Commit con messaggio descrittivo
git add -A
git commit -m "feat: add email notification settings

- Add SMTP configuration fields in Settings
- Add email template customization
- Update backend to send emails via Nodemailer

Updated docs/IMPLEMENTATION_SUMMARY.md with new settings.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Push (trigger auto-deploy)
git push origin main

# 6. Verifica deploy su Render
# Check https://dashboard.render.com logs
```

### 💡 Best Practices

**DO**:
- ✅ Documentare MENTRE scrivi codice, non dopo
- ✅ Usare esempi concreti nella documentazione
- ✅ Includere code snippets quando utile
- ✅ Specificare file paths con line numbers quando rilevante
- ✅ Mantenere TOC (indice) aggiornato se aggiungi sezioni

**DON'T**:
- ❌ Committare senza aggiornare docs
- ❌ Scrivere solo "varie modifiche" nei commit
- ❌ Lasciare documentazione obsoleta
- ❌ Dimenticare di aggiornare la data
- ❌ Usare file .md sul Desktop come reference principale

---

**Ultimo aggiornamento**: 26 Ottobre 2025
**Maintained by**: Claude Code

**NOTA PER CLAUDE AI**: Quando modifichi codice in questo progetto, DEVI sempre aggiornare i file .md rilevanti prima di committare. Non è opzionale.
