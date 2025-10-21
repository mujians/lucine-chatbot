# LUCINE CHATBOT - FUNZIONI DEL SISTEMA

**Data Creazione:** 2025-10-21
**Ultima Modifica:** 2025-10-21
**Status:** ✅ Backend Deployato | ⚠️ Dashboard in Ricostruzione | ⏳ Widget da Verificare

---

## PANORAMICA SISTEMA

**Lucine Chatbot** è un sistema di customer support intelligente per e-commerce Shopify che combina:
- **AI Assistant** (OpenAI GPT-4) per risposte automatiche basate su knowledge base RAG
- **Human Handoff** verso operatori umani quando AI non è sicura (confidence < 70%)
- **Dual-Channel Ticketing** via WhatsApp (Twilio) ed Email per supporto asincrono
- **Real-time Dashboard** per operatori con WebSocket

---

## ARCHITETTURA SISTEMA

```
┌─────────────────┐
│  Shopify Store  │
│  (Widget Chat)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Backend API + WebSocket         │
│  https://chatbot-lucy-2025.onrender.com │
│                                         │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ Express │  │Socket.io │  │Prisma  │ │
│  │   API   │  │WebSocket │  │  ORM   │ │
│  └─────────┘  └──────────┘  └────────┘ │
│                                         │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ OpenAI  │  │  Twilio  │  │Email   │ │
│  │ GPT-4   │  │WhatsApp  │  │Service │ │
│  └─────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
         │                      │
         ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│PostgreSQL + Vector│  │ Operator Dashboard│
│  (Knowledge Base) │  │  (React + Shadcn) │
└──────────────────┘  └──────────────────┘
```

---

## FUNZIONI PRINCIPALI

### 1. CHAT INTELLIGENTE (AI-First)

**Funzione:** Cliente inizia chat dal widget Shopify → AI risponde automaticamente

**Flow:**
1. **Cliente apre widget** su Shopify store
2. **Invia messaggio** → Backend crea sessione chat con status `WAITING`
3. **AI analizza messaggio:**
   - Usa knowledge base (RAG con embeddings pgvector)
   - Genera risposta con GPT-4
   - Calcola confidence score (0-100%)
4. **Decision Tree:**
   - **Se confidence ≥ 70%** → AI risponde, status diventa `ACTIVE`
   - **Se confidence < 70%** → Richiede operatore umano, status diventa `WAITING`
5. **Monitoring continuo** della conversazione AI
6. **Se cliente chiede esplicitamente operatore** → Handoff immediato

**Tecnologie:**
- OpenAI API (GPT-4 + Embeddings)
- PostgreSQL pgvector extension
- RAG (Retrieval-Augmented Generation)

**Endpoints API:**
- `POST /api/chat/sessions` - Crea nuova sessione
- `POST /api/chat/sessions/:id/messages` - Invia messaggio
- `GET /api/chat/sessions/:id` - Recupera conversazione
- `POST /api/chat/sessions/:id/request-operator` - Richiedi operatore

**WebSocket Events:**
- `new_message` - Nuovo messaggio in chat
- `ai_response` - Risposta AI generata
- `operator_requested` - Cliente chiede operatore

---

### 2. HUMAN HANDOFF (Operatori)

**Funzione:** Quando AI non è sicura o cliente richiede, operatore prende controllo

**Flow:**
1. **Chat passa a status `WAITING`** (in coda operatori)
2. **Operatori vedono notifica** in dashboard real-time
3. **Operatore clicca "Take Chat"** → Status diventa `WITH_OPERATOR`
4. **Conversazione live** tra operatore e cliente
5. **Operatore chiude chat** quando risolto → Status diventa `CLOSED`
6. **Sistema crea ticket automaticamente** se cliente offline

**Dashboard Operatore:**
- **Sidebar sinistra:** Status (Online/Away/Busy), Navigazione
- **Panel centrale:** Lista chat attive con search/filters
- **Panel destra:** Finestra conversazione con input

**Status Operatore:**
- `ONLINE` - Disponibile per nuove chat (verde)
- `AWAY` - Non disponibile temporaneamente (giallo)
- `BUSY` - In chat, non accetta nuove (rosso)
- `OFFLINE` - Non connesso (grigio)

**Endpoints API:**
- `GET /api/chat/sessions` - Lista chat (filtro per operatore)
- `POST /api/chat/sessions/:id/assign` - Assegna chat a operatore
- `POST /api/chat/sessions/:id/close` - Chiudi chat
- `PATCH /api/operators/me/status` - Cambia status operatore
- `GET /api/operators/me/toggle-availability` - Toggle online/offline

**WebSocket Events:**
- `new_chat_request` - Nuova chat in coda
- `chat_assigned` - Chat assegnata a operatore
- `operator_joined` - Operatore entra in chat
- `operator_left` - Operatore lascia chat
- `chat_closed` - Chat chiusa

---

### 3. TICKETING DUAL-CHANNEL

**Funzione:** Sistema di supporto asincrono via WhatsApp o Email

**Trigger Automatici:**
1. **Chat timeout:** Cliente non risponde per >10 minuti → Crea ticket automatico
2. **Operatore offline:** Nessun operatore disponibile → Crea ticket
3. **Cliente chiude browser:** Sessione interrotta → Crea ticket con conversazione
4. **Operatore crea manualmente:** Da dashboard durante chat

**Flow Ticket WhatsApp:**
1. Sistema invia messaggio WhatsApp (Twilio) al cliente
2. Cliente risponde via WhatsApp → Aggiorna ticket
3. Operatore risponde da dashboard → Invia via WhatsApp
4. Thread conversazione continua fino a chiusura

**Flow Ticket Email:**
1. Sistema invia email al cliente con ID ticket
2. Cliente risponde all'email → Parsing e aggiornamento ticket
3. Operatore risponde da dashboard → Invia email
4. Thread conversazione via email

**Campi Ticket:**
- `id` (UUID)
- `userId` (cliente)
- `operatorId` (assegnato)
- `subject` (oggetto)
- `status` (PENDING, OPEN, ASSIGNED, RESOLVED, CLOSED)
- `priority` (LOW, NORMAL, HIGH, URGENT)
- `contactMethod` (WHATSAPP, EMAIL)
- `contactValue` (numero/email)
- `messages[]` (thread conversazione)
- `notes` (note interne operatore)
- `createdAt`, `resolvedAt`

**Endpoints API:**
- `GET /api/tickets` - Lista tickets (filtri: status, priority, operator)
- `POST /api/tickets` - Crea ticket manuale
- `GET /api/tickets/:id` - Dettaglio ticket
- `PATCH /api/tickets/:id` - Aggiorna ticket (status, priority, notes)
- `POST /api/tickets/:id/messages` - Aggiungi messaggio al ticket
- `POST /api/tickets/:id/close` - Chiudi ticket con note finali

**WebSocket Events:**
- `new_ticket_created` - Nuovo ticket creato
- `ticket_assigned` - Ticket assegnato a operatore
- `ticket_updated` - Ticket aggiornato
- `ticket_message` - Nuovo messaggio in ticket
- `ticket_resolved` - Ticket risolto

---

### 4. KNOWLEDGE BASE (RAG)

**Funzione:** Repository documenti per AI (FAQ, politiche, prodotti, guide)

**Tecnologia:**
- **Embeddings:** OpenAI text-embedding-3-small
- **Vector DB:** PostgreSQL con pgvector extension
- **Chunking:** Documenti divisi in chunk 500-1000 caratteri
- **Similarity Search:** Cosine similarity su embeddings

**Tipi Documenti:**
- `FAQ` - Domande frequenti
- `POLICY` - Politiche negozio (resi, spedizioni, privacy)
- `PRODUCT` - Informazioni prodotti
- `GUIDE` - Guide e tutorial

**Flow Upload Documento:**
1. Operatore carica file (TXT, PDF, Markdown)
2. Sistema fa parsing e chunking
3. Genera embeddings per ogni chunk (OpenAI API)
4. Salva in database con vettori
5. Disponibile per AI nelle risposte

**Flow Query AI:**
1. Cliente fa domanda
2. Sistema genera embedding della domanda
3. Vector search trova top 3-5 chunk rilevanti
4. Chunk + domanda → GPT-4 genera risposta
5. Confidence score basato su similarity

**Endpoints API:**
- `GET /api/knowledge` - Lista documenti
- `POST /api/knowledge` - Upload nuovo documento
- `GET /api/knowledge/:id` - Dettaglio documento
- `PATCH /api/knowledge/:id` - Modifica documento
- `DELETE /api/knowledge/:id` - Elimina documento
- `POST /api/knowledge/search` - Ricerca semantica

**Campi Documento:**
- `id` (UUID)
- `title` (titolo)
- `content` (contenuto originale)
- `type` (FAQ, POLICY, PRODUCT, GUIDE)
- `embedding` (vector 1536 dimensioni)
- `metadata` (JSON con tags, categorie, etc.)
- `isActive` (boolean)
- `createdBy` (operatore)
- `createdAt`, `updatedAt`

---

### 5. GESTIONE OPERATORI

**Funzione:** Admin gestisce team operatori (CRUD, permessi, statistiche)

**Ruoli:**
- `ADMIN` - Tutti i permessi (gestione operatori, settings)
- `OPERATOR` - Gestione chat e ticket
- `VIEWER` - Solo visualizzazione (reports, analytics)

**Funzionalità Admin:**
- Crea nuovo operatore (email, password, nome, ruolo)
- Modifica dati operatore
- Disabilita/abilita operatore
- Visualizza statistiche operatore (chat gestite, tempo risposta, rating)
- Assegna chat/ticket a operatore specifico

**Statistiche Operatore:**
- Numero chat gestite (oggi, settimana, mese)
- Tempo medio risposta
- Tempo medio risoluzione
- Customer satisfaction rating
- Status corrente e tempo online
- Chat attive in questo momento

**Endpoints API:**
- `GET /api/operators` - Lista operatori
- `POST /api/operators` - Crea operatore (admin only)
- `GET /api/operators/:id` - Dettaglio operatore
- `PATCH /api/operators/:id` - Modifica operatore
- `DELETE /api/operators/:id` - Elimina operatore (soft delete)
- `GET /api/operators/:id/stats` - Statistiche operatore
- `GET /api/operators/me` - Profilo operatore corrente
- `PATCH /api/operators/me` - Modifica profilo

**Campi Operatore:**
- `id` (UUID)
- `email` (unique)
- `password` (bcrypt hash)
- `name`
- `role` (ADMIN, OPERATOR, VIEWER)
- `status` (ONLINE, AWAY, BUSY, OFFLINE)
- `isAvailable` (boolean)
- `isActive` (boolean - soft delete)
- `createdAt`, `lastLoginAt`

---

### 6. SETTINGS & CONFIGURAZIONE

**Funzione:** Configurazione globale sistema (API keys, parametri, temi)

**Categorie Settings:**

#### AI Settings
- `openaiApiKey` - OpenAI API key
- `aiModel` - Modello GPT (default: gpt-4-turbo-preview)
- `aiConfidenceThreshold` - Soglia confidence per handoff (default: 70%)
- `aiMaxTokens` - Max tokens risposta (default: 500)
- `aiTemperature` - Temperature GPT (default: 0.7)
- `embeddingModel` - Modello embeddings (default: text-embedding-3-small)

#### WhatsApp Settings (Twilio)
- `twilioAccountSid`
- `twilioAuthToken`
- `twilioWhatsappNumber` - Numero WhatsApp business
- `twilioWebhookUrl` - Webhook per messaggi in arrivo

#### Email Settings
- `emailProvider` - Provider (SMTP, SendGrid, etc.)
- `emailFrom` - Email mittente
- `smtpHost`, `smtpPort`, `smtpUser`, `smtpPassword`

#### Chat Settings
- `chatTimeoutMinutes` - Timeout inattività chat (default: 10)
- `maxChatsPerOperator` - Max chat simultanee per operatore (default: 3)
- `autoAssignChats` - Auto-assign chat a operatori disponibili (boolean)
- `chatWelcomeMessage` - Messaggio benvenuto widget

#### Widget Settings
- `widgetTheme` - Tema widget (light/dark)
- `widgetPosition` - Posizione widget (bottom-right, bottom-left)
- `widgetPrimaryColor` - Colore primario
- `widgetEnabled` - Abilita/disabilita widget (boolean)

**Endpoints API:**
- `GET /api/settings` - Tutti settings (admin only, hide sensitive)
- `PATCH /api/settings` - Aggiorna settings (admin only)
- `GET /api/settings/public` - Settings pubblici per widget

**Security:**
- API keys MAI esposte in frontend
- Solo admin può modificare
- Validation rigorosa input
- Encryption sensitive data at rest

---

### 7. BACKGROUND JOBS

**Funzione:** Job automatici in background per monitoring e cleanup

#### Job 1: Chat Timeout Monitor
**Frequenza:** Ogni 60 secondi
**Funzione:**
- Trova chat con status `ACTIVE` o `WITH_OPERATOR`
- Controlla se ultimo messaggio > 10 minuti fa
- Se timeout → Crea ticket automatico con conversazione
- Invia notifica cliente via metodo preferito
- Chiude chat con status `CLOSED`

**Codice:**
```javascript
// backend/src/services/background-jobs.service.js
async function checkChatTimeouts() {
  const timeoutMinutes = 10;
  const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

  const timedOutChats = await prisma.chatSession.findMany({
    where: {
      status: { in: ['ACTIVE', 'WITH_OPERATOR'] },
      lastMessageAt: { lt: cutoffTime },
    },
    include: { messages: true, user: true },
  });

  for (const chat of timedOutChats) {
    await createTicketFromChat(chat);
    await closeChatSession(chat.id);
  }
}
```

#### Job 2: Operator Disconnect Monitor
**Frequenza:** Ogni 30 secondi
**Funzione:**
- Trova operatori con status `ONLINE` o `BUSY`
- Controlla se WebSocket disconnesso > 5 minuti
- Se disconnesso → Cambia status a `OFFLINE`
- Ri-assegna chat attive ad altri operatori disponibili
- Invia notifica altri operatori

#### Job 3: Cleanup Old Data (Future)
**Frequenza:** Ogni 24 ore
**Funzione:**
- Archivia chat chiuse > 90 giorni
- Elimina sessioni anonime incomplete > 7 giorni
- Compatta vector embeddings non usati
- Genera backup database

---

### 8. ANALYTICS & REPORTING (Future)

**Funzione:** Dashboard analytics con metriche e KPI

**Metriche Chiave:**
- **Chat Volume:** Totale chat per periodo
- **AI Resolution Rate:** % chat risolte da AI senza operatore
- **Average Response Time:** Tempo medio prima risposta operatore
- **Average Resolution Time:** Tempo medio chiusura ticket
- **Customer Satisfaction:** Rating medio clienti
- **Operator Performance:** Confronto operatori
- **Busiest Hours:** Orari picco richieste
- **Top Issues:** Categorie problemi più frequenti

**Grafici:**
- Line chart: Chat volume nel tempo
- Pie chart: AI vs Human resolution
- Bar chart: Performance operatori
- Heatmap: Orari picco

**Endpoints API:**
- `GET /api/analytics/overview` - Overview metriche
- `GET /api/analytics/chats` - Analytics chat
- `GET /api/analytics/tickets` - Analytics tickets
- `GET /api/analytics/operators` - Analytics operatori
- `GET /api/analytics/export` - Export dati CSV/JSON

---

## FLUSSI COMPLETI (SCENARIOS)

### SCENARIO 1: Chat Completamente AI
1. Cliente apre widget su Shopify
2. Invia domanda: "Quali sono i tempi di spedizione?"
3. AI cerca in knowledge base → Trova documento POLICY spedizioni
4. Genera risposta con confidence 95%
5. Risponde al cliente con info spedizioni
6. Cliente soddisfatto, chiude chat
7. Sistema chiude sessione con status `CLOSED`

### SCENARIO 2: Chat con Handoff Operatore
1. Cliente chiede: "Vorrei modificare un ordine già effettuato"
2. AI non ha info specifiche ordine → Confidence 45%
3. Sistema richiede operatore, status `WAITING`
4. Notifica real-time a operatori disponibili
5. Operatore "Mario" prende chat → Status `WITH_OPERATOR`
6. Operatore chiede numero ordine, cerca nel sistema Shopify
7. Modifica ordine e conferma al cliente
8. Cliente soddisfatto
9. Operatore chiude chat con note "Modificato ordine #1234"

### SCENARIO 3: Chat con Timeout → Ticket WhatsApp
1. Cliente inizia chat alle 14:00
2. AI risponde, conversazione attiva
3. Cliente lascia pagina senza chiudere (distrazione)
4. Sistema nota ultimo messaggio alle 14:05
5. Alle 14:15 background job rileva timeout (>10 min)
6. Crea ticket con conversazione + contatto WhatsApp cliente
7. Invia WhatsApp: "Ciao! Abbiamo visto che eri interessato a... Possiamo aiutarti?"
8. Cliente risponde via WhatsApp il giorno dopo
9. Operatore gestisce ticket da dashboard
10. Risolve problema, chiude ticket

### SCENARIO 4: Upload Documento Knowledge Base
1. Admin va in sezione "Knowledge Base"
2. Click "Upload Document"
3. Seleziona file "FAQ_Resi.pdf"
4. Sistema fa parsing PDF
5. Divide in 15 chunks
6. Genera embeddings per ogni chunk (OpenAI API)
7. Salva in database con vettori
8. Documento attivo e disponibile per AI
9. Prossima domanda cliente su resi → AI usa nuovo documento

---

## TECNOLOGIE STACK

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **WebSocket:** Socket.io
- **ORM:** Prisma
- **Database:** PostgreSQL 14+ con pgvector
- **Auth:** JWT (jsonwebtoken)
- **Validation:** Joi / Zod
- **File Upload:** Multer
- **PDF Parsing:** pdf-parse
- **Cron Jobs:** node-cron

### Frontend Dashboard
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI Library:** Shadcn UI (@radix-ui components)
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Routing:** react-router-dom
- **State:** Context API + hooks
- **WebSocket:** socket.io-client
- **HTTP Client:** axios
- **Notifications:** sonner (toast)
- **Theme:** next-themes (dark/light)

### Frontend Widget
- **Framework:** React 18 (minimale)
- **Build:** Vite (output single bundle)
- **Styling:** Inline CSS / Tailwind (purged)
- **Deploy:** Shopify Theme Assets

### External Services
- **AI:** OpenAI API (GPT-4, Embeddings)
- **WhatsApp:** Twilio API
- **Email:** Nodemailer (SMTP) o SendGrid
- **Hosting:** Render.com
- **Database:** Render PostgreSQL

---

## DEPLOYMENT

### Backend
- **URL:** https://chatbot-lucy-2025.onrender.com
- **Platform:** Render Web Service
- **Build:** `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start:** `npm start` (node src/server.js)
- **Env Vars:** DATABASE_URL, OPENAI_API_KEY, TWILIO_*, SMTP_*, JWT_SECRET, CORS_ORIGINS

### Dashboard
- **URL:** https://chatbot-lucy-2025-1.onrender.com (VECCHIA - da sostituire)
- **Platform:** Render Static Site
- **Build:** `npm install && npm run build`
- **Publish:** `dist/`
- **Env Vars:** VITE_API_URL, VITE_WS_URL

### Widget
- **Deploy:** Shopify Theme Assets
- **File:** `snippets/lucine-chatbot-popup.liquid`
- **Assets:** `lucine-chatbot-widget.js`, `lucine-chatbot-widget.css`
- **Include:** `{% render 'lucine-chatbot-popup' %}` in `theme.liquid`

---

## CREDENZIALI & ACCESSI

### Admin Dashboard
- **Email:** admin@lucine.it
- **Password:** admin123
- **Ruolo:** ADMIN

### Database
- **Host:** Render PostgreSQL
- **Extensions:** pgvector
- **Backup:** Automatico Render

### API Keys Necessarie
- OpenAI API Key (in .env backend)
- Twilio Account SID + Auth Token + WhatsApp Number
- SMTP credentials (Gmail, SendGrid, etc.)

---

## STATO ATTUALE

### ✅ COMPLETATO
- Backend completo e deployato
- Database con migrations
- Tutte le API funzionanti
- WebSocket real-time
- Background jobs attivi
- Integrazioni OpenAI, Twilio, Email

### ⚠️ IN SVILUPPO
- Dashboard con layout corretto (operator-vue style)
- Rimozione emoji, uso lucide-react
- TypeScript + Shadcn UI
- Componenti TopBar, Sidebar, ChatListPanel, ChatWindow

### ⏳ DA FARE
- Widget Shopify ottimizzato
- Testing end-to-end completo
- Analytics dashboard
- Mobile responsive perfetto
- Documentazione utente finale

---

## NOTE IMPORTANTI

1. **NO EMOJI** - Usare solo lucide-react icons
2. **Layout FISSO** - TopBar + Sidebar (w-64) + ChatListPanel (w-96) + ChatWindow (flex-1)
3. **Shadcn UI OBBLIGATORIO** - Tutti componenti da @radix-ui
4. **TypeScript PREFERITO** - Per dashboard
5. **Real Data SEMPRE** - No mock, no dummy content
6. **WebSocket CRITICAL** - Notifiche real-time essenziali
7. **Background Jobs RUNNING** - Timeout monitoring attivo
8. **API Keys SECURE** - Mai in frontend, solo backend

---

**Documento da aggiornare SEMPRE quando:**
- Aggiungi nuova funzionalità
- Modifichi API endpoint
- Cambi flow utente
- Aggiungi integrazione esterna
- Modifichi schema database
