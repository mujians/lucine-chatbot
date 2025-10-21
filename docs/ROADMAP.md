# ROADMAP - Lucine Chatbot Dashboard

**Aggiornato:** 21 Ottobre 2025
**Versione Corrente:** 1.0.0 (Chat funzionanti)
**Target:** v1.5.0 (Sistema completo)

---

## VISION

Dashboard operatori professionale per sistema customer support intelligente (AI + Human) su e-commerce Shopify.

**Design Principles:**
- Stile operator-vue (layout fisso, pulito, professionale)
- NO emoji - solo lucide-react icons
- Shadcn UI components
- TypeScript obbligatorio
- Real-time WebSocket
- Real data sempre (no mock)

---

## MILESTONE COMPLETATE

### v0.5 - Backend Complete (COMPLETATO)
**Data:** 20 Ottobre 2025

- [x] Backend API completo (Express + Prisma)
- [x] Database PostgreSQL + pgvector
- [x] Autenticazione JWT
- [x] WebSocket real-time (Socket.io)
- [x] AI Integration (OpenAI GPT-4 + RAG)
- [x] Endpoints Chat, Tickets, Knowledge, Operators, Settings
- [x] Background jobs (timeout monitor)
- [x] Deploy su Render

### v1.0 - Chat Dashboard (COMPLETATO)
**Data:** 21 Ottobre 2025

- [x] Login/Logout JWT
- [x] Layout base (TopBar, Sidebar, ChatList, ChatWindow)
- [x] Lista chat real-time
- [x] Conversazione bidirezionale
- [x] Invio/ricezione messaggi WebSocket
- [x] Chiusura chat
- [x] Filtri status chat
- [x] Indicatore connessione
- [x] Loading states e error handling

---

## ROADMAP FUTURE

### v1.1 - Tickets System (PROSSIMO)
**Target:** Fine Ottobre 2025
**Priorità:** ALTA

**Features:**
- [ ] Pagina `/tickets`
- [ ] Lista ticket con filtri (status, priority)
- [ ] Dettaglio ticket con conversazione
- [ ] Assegnazione ticket a operatore
- [ ] Chiusura ticket con resolution notes
- [ ] Notifiche real-time nuovi ticket (WebSocket)
- [ ] Resume ticket da token

**Componenti da creare:**
- `pages/Tickets.tsx`
- `components/tickets/TicketList.tsx`
- `components/tickets/TicketDetail.tsx`
- `components/tickets/TicketFilters.tsx`
- `components/tickets/AssignOperatorDialog.tsx`
- `hooks/useTickets.ts`

**API Backend (già pronte):**
- GET /api/tickets
- GET /api/tickets/:id
- POST /api/tickets/:id/assign
- POST /api/tickets/:id/resolve

**Tempo stimato:** 8-10 ore

---

### v1.2 - Knowledge Base
**Target:** Novembre 2025
**Priorità:** MEDIA

**Features:**
- [ ] Pagina `/knowledge`
- [ ] Lista documenti knowledge base
- [ ] CRUD documenti (crea, modifica, elimina)
- [ ] Categorizzazione documenti
- [ ] Upload file (PDF, TXT, Markdown)
- [ ] Search semantica
- [ ] Toggle attivo/inattivo
- [ ] Preview documento

**Componenti:**
- `pages/Knowledge.tsx`
- `components/knowledge/DocumentList.tsx`
- `components/knowledge/DocumentForm.tsx`
- `components/knowledge/DocumentPreview.tsx`
- `components/knowledge/CategoryFilter.tsx`
- `hooks/useKnowledge.ts`

**API Backend (già pronte):**
- GET /api/knowledge
- POST /api/knowledge
- PUT /api/knowledge/:id
- DELETE /api/knowledge/:id
- PATCH /api/knowledge/:id/toggle

**Tempo stimato:** 6-8 ore

---

### v1.3 - Settings & Admin
**Target:** Novembre 2025
**Priorità:** MEDIA

**Features:**

#### Settings
- [ ] Pagina `/settings`
- [ ] Config AI (model, temperature, confidence threshold)
- [ ] Config WhatsApp/Twilio (account SID, auth token, numero)
- [ ] Config Email/SMTP (host, port, user, password)
- [ ] Config Widget (tema, colori, posizione)
- [ ] Validazione input
- [ ] Save/Reset settings

#### Gestione Operatori (Admin only)
- [ ] Pagina `/operators`
- [ ] Lista operatori con stats
- [ ] Crea nuovo operatore
- [ ] Modifica operatore (nome, email, ruolo)
- [ ] Statistiche operatore (chat gestite, tempo medio, rating)
- [ ] Soft delete operatore
- [ ] Role-based access control

**Componenti:**
- `pages/Settings.tsx`
- `pages/Operators.tsx`
- `components/settings/AISettings.tsx`
- `components/settings/WhatsAppSettings.tsx`
- `components/settings/EmailSettings.tsx`
- `components/operators/OperatorList.tsx`
- `components/operators/OperatorForm.tsx`
- `components/operators/OperatorStats.tsx`

**Tempo stimato:** 8-10 ore

---

### v1.4 - Profile & UX Improvements
**Target:** Novembre 2025
**Priorità:** BASSA

**Features:**
- [ ] Pagina `/profile` operatore
- [ ] Modifica profilo (nome, email)
- [ ] Change password
- [ ] Toggle disponibilità (online/offline)
- [ ] Preferenze notifiche
- [ ] Avatar upload
- [ ] Statistiche personali
- [ ] Toast notifications system
- [ ] Keyboard shortcuts
- [ ] Dark/Light theme toggle

**Tempo stimato:** 4-6 ore

---

### v1.5 - Analytics Dashboard
**Target:** Dicembre 2025
**Priorità:** BASSA

**Features:**
- [ ] Pagina `/analytics`
- [ ] KPI cards (chat volume, resolution rate, avg response time)
- [ ] Charts (line, bar, pie)
- [ ] AI vs Human resolution breakdown
- [ ] Operator performance leaderboard
- [ ] Busiest hours heatmap
- [ ] Top issues categories
- [ ] Export data (CSV, JSON)
- [ ] Date range filters

**Libraries:**
- Recharts o Chart.js per grafici
- date-fns per date handling

**Tempo stimato:** 10-12 ore

---

### v2.0 - Advanced Features (Future)
**Target:** 2026 Q1
**Priorità:** FUTURE

**Possibili features:**
- [ ] Mobile app (React Native)
- [ ] Push notifications (FCM)
- [ ] Multi-language support (i18n)
- [ ] Voice messages support
- [ ] File attachments in chat
- [ ] Canned responses (quick replies)
- [ ] Auto-assignment algoritmo intelligente
- [ ] SLA tracking e alerts
- [ ] Customer satisfaction surveys
- [ ] Integration con CRM (Salesforce, HubSpot)

---

## WIDGET SHOPIFY - STATUS SEPARATO

### Problema Attuale
Widget esistente usa API VECCHIE incompatibili con nuovo backend.

### Fix Necessario (URGENTE)
- [ ] Adattare chiamate API widget:
  - Crea sessione: `POST /api/chat/session`
  - Invia messaggio: `POST /api/chat/session/:id/message`
- [ ] Aggiornare WebSocket event handlers
- [ ] Aggiungere `https://lucinedinatale.it` in backend CORS_ORIGINS
- [ ] Test integrazione end-to-end (widget ’ backend ’ dashboard)
- [ ] Deploy widget su Shopify

**Tempo stimato:** 4-6 ore

**File widget:** `/Users/brnobtt/Desktop/chatbot-widget-PRONTO.liquid` (49KB, ~1700 righe)

---

## DEPENDENCIES & BLOCKERS

### Completato
- [x] Backend API completo
- [x] Database setup con pgvector
- [x] Dashboard base funzionante
- [x] WebSocket real-time
- [x] Shadcn UI setup

### In Attesa
- [ ] Widget fix (blocker per test end-to-end)

### Nessun Blocker Tecnico
Tutte le API backend sono pronte. Solo sviluppo frontend mancante.

---

## EFFORT ESTIMATION

| Feature | Priorità | Ore Stimate | Status |
|---------|----------|-------------|--------|
| Chat Dashboard | ALTA | 12-16h | COMPLETATO |
| Tickets | ALTA | 8-10h | DA FARE |
| Knowledge Base | MEDIA | 6-8h | DA FARE |
| Settings | MEDIA | 8-10h | DA FARE |
| Operators Admin | MEDIA | 4-6h | DA FARE |
| Profile & UX | BASSA | 4-6h | DA FARE |
| Analytics | BASSA | 10-12h | DA FARE |
| Widget Fix | URGENTE | 4-6h | DA FARE |

**Totale stimato per v1.5:** 46-64 ore (~6-8 giorni lavorativi)

---

## RELEASE STRATEGY

### v1.1 (Fine Ottobre)
- Tickets completo
- Widget fix e integrazione end-to-end
- Test produzione
- Deploy

### v1.2 (Metà Novembre)
- Knowledge Base
- Settings basic

### v1.3 (Fine Novembre)
- Operators management
- Profile page

### v1.4 (Dicembre)
- Analytics
- Polish UX

### v1.5 (Fine Dicembre)
- Sistema completo
- Documentazione finale
- Handoff

---

## QUALITY CHECKLIST

Per ogni release:
- [ ] Build produzione senza errori TypeScript
- [ ] Tutti componenti testati manualmente
- [ ] WebSocket connessione stabile
- [ ] Error handling completo
- [ ] Loading states everywhere
- [ ] Responsive design verificato
- [ ] CORS configurato correttamente
- [ ] Environment variables documentate
- [ ] README aggiornato
- [ ] SYSTEM_STATUS_REPORT.md aggiornato

---

## NOTES

**Decisioni Architetturali:**
- Single-page application (SPA) con React Router
- Context API per state management (no Redux per semplicità)
- Axios per HTTP client
- Socket.io-client per WebSocket
- Shadcn UI (no custom components library)
- TypeScript strict mode
- ESLint + Prettier per code quality

**Code Style:**
- Componenti funzionali con hooks
- Props tipizzate con interface
- File max 300 righe
- NO emoji nel codice
- Commenti solo se necessari
- Naming consistente (PascalCase componenti, camelCase funzioni/variables)

**Deploy:**
- Render Static Site per dashboard
- Auto-deploy su push main branch
- Environment variables su Render dashboard
- Build: `npm install && npm run build`
- Publish: `dist/`

---

**Roadmap creata:** 21 Ottobre 2025
**Prossimo aggiornamento:** Post v1.1 release
