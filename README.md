# Lucine Chatbot - Dashboard Operatori

**Aggiornato:** 7 Novembre 2025 | **Versione:** 2.3.12 | **Status:** ✅ Production Ready

Dashboard web real-time per operatori del sistema Lucine Chatbot - customer support intelligente (AI + Human) per e-commerce Shopify.

## 🚀 Deployment Automatico

⚠️ **IMPORTANTE - Workflow di Deploy:**
- **NON testare in locale** - sempre direttamente in produzione
- `git push` → Render.com autodeploy automatico
- URL Produzione: https://lucine-dashboard.onrender.com

---

## Quick Start

```bash
# Installa dipendenze
npm install

# Development
npm run dev      # http://localhost:5173

# Build produzione
npm run build

# Preview build
npm run preview
```

**Login Test:**
- Email: admin@lucine.it
- Password: admin123

---

## Stack Tecnologico

- **React 18** + **TypeScript**
- **Vite** - Build tool ultra-veloce
- **Tailwind CSS** - Utility-first CSS
- **Shadcn UI** - Radix UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - WebSocket real-time
- **Lucide React** - Icons (NO EMOJI)
- **date-fns** - Date utilities

---

## Architettura Sistema

```
Widget Shopify   →   Backend API      →   Dashboard
(Cliente)            (chatbot-lucy-2025)   (Operatore)
                           ↓
                    PostgreSQL + pgvector
```

**Deployed Services:**
- Backend: https://chatbot-lucy-2025.onrender.com
- Dashboard: https://lucine-dashboard.onrender.com
- Database: Render PostgreSQL (con pgvector extension)

---

## Funzionalità

### IMPLEMENTATE (v1.0)
- [x] Autenticazione JWT (login/logout)
- [x] Lista chat real-time con filtri
- [x] Finestra conversazione bidirezionale
- [x] Invio/ricezione messaggi WebSocket
- [x] Status chat (ACTIVE, WAITING, WITH_OPERATOR, CLOSED)
- [x] UI Layout responsive (TopBar, Sidebar, ChatList, ChatWindow)
- [x] Indicatore connessione WebSocket
- [x] Loading states e error handling

### NUOVE FEATURE (v1.1 - Appena Implementate)
- [x] **Typing Indicator** - Mostra "operatore/utente sta scrivendo..." in tempo reale
- [x] **Mark as Read** - Segna messaggi come letti quando apri chat
- [x] **Internal Notes** - Sistema completo di note private tra operatori con sidebar
- [x] **File Upload UI** - Caricamento allegati (immagini, PDF, documenti) con preview
- [x] **Priority & Tags** - Sistema priorità chat (LOW/NORMAL/HIGH/URGENT) + tags custom
- [x] **User History** - Visualizza storico completo conversazioni precedenti utente
- [x] **Convert to Ticket** - Converti chat in ticket per follow-up asincrono

### DA IMPLEMENTARE (v1.2+)
- [ ] Tickets (lista completa, dettaglio, assegnazione, chiusura)
- [ ] Knowledge Base (CRUD documenti, categorie, upload bulk)
- [ ] Gestione Operatori (admin: CRUD, stats performance)
- [ ] Settings (AI, WhatsApp, Email config completa)
- [ ] Analytics Dashboard
- [ ] Notifiche push browser
- [ ] Mobile responsive ottimizzato

---

## Struttura Progetto

```
lucine-production/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Layout components
│   │   │   ├── TopBar.tsx
│   │   │   ├── OperatorSidebar.tsx
│   │   │   ├── ChatListPanel.tsx
│   │   │   └── ChatWindow.tsx
│   │   └── ui/                 # Shadcn UI components
│   ├── contexts/
│   │   ├── AuthContext.tsx     # JWT auth state
│   │   └── SocketContext.tsx   # WebSocket connection
│   ├── pages/
│   │   ├── Index.tsx           # Main dashboard (chat)
│   │   └── Login.tsx
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx                 # Router + Providers
│   └── main.tsx                # Entry point
├── docs/                       # Documentazione tecnica
│   ├── SYSTEM_STATUS_REPORT.md # Stato implementazione
│   ├── IMPLEMENTATION_PLAN.md  # Piano sviluppo
│   ├── TECHNICAL_SCHEMA.md     # API reference completo
│   ├── TOOL_FUNCTIONS.md       # Funzioni sistema
│   └── ROADMAP.md
├── public/
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Environment Variables

```env
# .env (local)
VITE_API_URL=https://chatbot-lucy-2025.onrender.com/api

# Render (production)
VITE_API_URL=https://chatbot-lucy-2025.onrender.com/api
```

---

## API Backend

**Base URL:** `https://chatbot-lucy-2025.onrender.com/api`
**Auth:** JWT Bearer token (Header: `Authorization: Bearer <token>`)

**Endpoint Chiave:**
```
POST   /auth/login                    # Login
GET    /chat/sessions                 # Lista chat
GET    /chat/sessions/:id             # Dettaglio
POST   /chat/sessions/:id/close       # Chiudi
GET    /tickets                       # Lista ticket
GET    /knowledge                     # Knowledge base
GET    /operators                     # Operatori (admin)
```

**WebSocket Events:**
```javascript
// Client → Server
socket.emit('join_dashboard', operatorId)
socket.emit('operator_message', { sessionId, message })

// Server → Client
socket.on('new_chat_request', data)
socket.on('user_message', data)
socket.on('chat_closed', data)
```

---

## Design System

**Regole:**
- NO emoji - solo lucide-react icons
- Layout FISSO: TopBar + Sidebar (w-64) + Content
- Shadcn UI obbligatorio per componenti
- TypeScript per tutto
- Real data sempre (no mock/placeholder)

**Palette:**
```css
--primary: #059669      /* Verde */
--danger: #dc2626       /* Rosso */
--warning: #f59e0b      /* Ambra */
--muted: #6b7280        /* Grigio */
```

---

## Deploy (Render)

**Build Command:**
```bash
npm install && npm run build
```

**Publish Directory:** `dist/`

**Auto-Deploy:** Push su `main` → build automatico

---

## Development

### Comandi Utili

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

### Hot Reload

Vite HMR attivo - modifiche instant reload senza perdere state.

### Debug WebSocket

Apri DevTools Console - logs prefissati:
```
🔌 Connecting to WebSocket: ...
✅ WebSocket connected
📨 New message: ...
```

---

## Testing

```bash
# Unit tests (future)
npm run test

# E2E tests (future)
npm run test:e2e
```

---

## Troubleshooting

**CORS Error:**
- Verifica `CORS_ORIGINS` su backend include dominio dashboard

**WebSocket Disconnected:**
- Controlla Console per errori
- Verifica backend online: https://chatbot-lucy-2025.onrender.com/health

**Login Failed:**
- Verifica credenziali (admin@lucine.it / admin123)
- Controlla Network tab per response error

---

## Prossimi Step

1. **Tickets** (ALTA priorità)
   - Pagina lista ticket con filtri
   - Dettaglio conversazione ticket
   - Assegnazione e chiusura

2. **Knowledge Base** (MEDIA)
   - CRUD documenti
   - Upload file (PDF, TXT)
   - Categorizzazione

3. **Settings** (BASSA)
   - Config AI, WhatsApp, Email
   - Gestione operatori (admin)

4. **Widget Fix**
   - Adattare API calls a nuovo backend
   - Test integrazione end-to-end

Vedi `docs/IMPLEMENTATION_PLAN.md` per dettagli.

---

## Riferimenti

- Backend: Repository separato (chatbot-lucy-2025)
- Design: operator-vue style
- UI Components: [Shadcn UI](https://ui.shadcn.com)
- Icons: [Lucide React](https://lucide.dev)
- Docs: `docs/` folder

---

**Ultimo aggiornamento:** 21 Ottobre 2025
