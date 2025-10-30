# 🚀 Lucine Chatbot - Deploy & Repository Info

**Last Updated**: 30 Ottobre 2025

---

## 📂 Project Structure

Questo progetto è composto da **3 componenti separati** con **2 repository Git**:

```
Desktop/
├── lucine-production/          # 🔷 REPO 1: Backend + Dashboard
│   ├── backend/                # Node.js + Express + Prisma + PostgreSQL
│   ├── src/                    # React + TypeScript Dashboard
│   ├── dist/                   # Dashboard build output
│   └── docs/                   # Documentation
│
└── lucine-minimal/             # 🔶 REPO 2: Shopify Theme + Widget
    ├── snippets/
    │   └── chatbot-popup.liquid   # Widget principale
    ├── layout/
    ├── locales/
    └── assets/
```

---

## 🔗 Git Repositories

### Repository 1: Backend + Dashboard
- **Nome**: `lucine-chatbot`
- **GitHub**: https://github.com/mujians/lucine-chatbot
- **Path Locale**: `/Users/brnobtt/Desktop/lucine-production`
- **Branch**: `main`

### Repository 2: Shopify Theme (Widget)
- **Nome**: `lucine25minimal`
- **GitHub**: https://github.com/mujians/lucine25minimal
- **Path Locale**: `/Users/brnobtt/Desktop/lucine-minimal`
- **Branch**: `main`

---

## 🚀 Auto-Deploy Configuration

### Backend + Dashboard → Render.com

**Render Service 1: Backend API**
- **URL**: https://chatbot-lucy-2025.onrender.com
- **Type**: Web Service
- **Build**: `cd backend && npm install && npx prisma generate`
- **Start**: `cd backend && npm start`
- **Auto-deploy**: ✅ Quando puschi su `lucine-chatbot` repo

**Render Service 2: Dashboard Frontend**
- **URL**: https://lucine.onrender.com
- **Type**: Static Site
- **Build**: `npm install && npm run build`
- **Publish**: `dist`
- **Auto-deploy**: ✅ Quando puschi su `lucine-chatbot` repo

### Widget → Shopify Theme

**Shopify Store**
- **URL**: [Il tuo store Shopify]
- **Theme**: lucine25minimal
- **Auto-deploy**: ✅ Connesso a GitHub `lucine25minimal` repo
- **Deploy**: Automatico quando puschi su GitHub

---

## 📁 File Principali per Modifiche

### Backend (lucine-production/backend/)
```
backend/
├── src/
│   ├── controllers/
│   │   ├── chat.controller.js      # ⭐ Chat logic, operator request
│   │   ├── ticket.controller.js    # Ticket management
│   │   └── analytics.controller.js # Analytics
│   │
│   ├── routes/
│   │   ├── chat.routes.js          # ⭐ API endpoints
│   │   ├── ticket.routes.js
│   │   └── analytics.routes.js
│   │
│   ├── services/
│   │   ├── websocket.service.js    # ⭐ WebSocket events
│   │   ├── ai.service.js           # OpenAI integration
│   │   └── upload.service.js       # File uploads
│   │
│   └── server.js                   # Entry point
│
└── prisma/
    └── schema.prisma               # ⭐ Database schema
```

### Dashboard (lucine-production/src/)
```
src/
├── pages/
│   ├── Index.tsx                   # ⭐ Main dashboard page
│   ├── Settings.tsx                # Settings page
│   └── Login.tsx                   # Auth page
│
├── components/
│   └── dashboard/
│       ├── ChatListPanel.tsx       # ⭐ Chat list with Accept button
│       ├── ChatWindow.tsx          # Chat messages display
│       └── AnalyticsDashboard.tsx  # Analytics view
│
└── lib/
    ├── api.ts                      # ⭐ API client methods
    └── socket.ts                   # WebSocket client
```

### Widget (lucine-minimal/)
```
snippets/
└── chatbot-popup.liquid            # ⭐ TUTTO IL WIDGET (2400+ righe)
                                    # Include: HTML, CSS, JavaScript
```

---

## 🔄 Workflow di Deploy

### 1. Modifiche Backend/Dashboard
```bash
cd /Users/brnobtt/Desktop/lucine-production

# 1. Fai modifiche ai file
# 2. Build (opzionale - Render lo fa automaticamente)
npm run build

# 3. Commit
git add .
git commit -m "feat: descrizione modifiche"

# 4. Push → Auto-deploy su Render
git push origin main

# 5. Verifica deploy
# Render Dashboard: https://dashboard.render.com
# Attendi 2-3 minuti per il deploy
```

### 2. Modifiche Widget
```bash
cd /Users/brnobtt/Desktop/lucine-minimal

# 1. Modifica snippets/chatbot-popup.liquid
# 2. Commit
git add snippets/chatbot-popup.liquid
git commit -m "feat: descrizione modifiche widget"

# 3. Push → Auto-deploy su Shopify
git push origin main

# 4. Verifica
# Shopify aggiorna il theme automaticamente
# Vai sullo store e testa il widget
```

### 3. Modifiche Database Schema
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend

# 1. Modifica prisma/schema.prisma
# 2. Crea migration
npx prisma migrate dev --name descrizione_modifica

# 3. Commit migration + schema
git add prisma/
git commit -m "db: descrizione modifica schema"

# 4. Push
git push origin main

# 5. Render esegue automaticamente:
#    - npx prisma generate
#    - npx prisma migrate deploy (in produzione)
```

---

## 🧪 Testing Locale

### Backend + Dashboard Locale
```bash
# Terminal 1: Backend
cd /Users/brnobtt/Desktop/lucine-production/backend
npm run dev
# Runs on: http://localhost:5000

# Terminal 2: Dashboard
cd /Users/brnobtt/Desktop/lucine-production
npm run dev
# Runs on: http://localhost:5173

# Backend API: http://localhost:5000/api
# Dashboard:   http://localhost:5173
# WebSocket:   ws://localhost:5000
```

### Widget Testing
```bash
# Usa test-widget.html per testare locale
cd /Users/brnobtt/Desktop/lucine-production
open test-widget.html
# Oppure serve con un server:
python3 -m http.server 8000
# Apri: http://localhost:8000/test-widget.html
```

---

## 📊 Environment Variables

### Backend (.env in lucine-production/backend/)
```bash
DATABASE_URL=postgresql://...        # Render PostgreSQL
JWT_SECRET=...                       # Auth token secret
OPENAI_API_KEY=sk-...               # OpenAI API key
CORS_ORIGIN=https://lucine.onrender.com
NODE_ENV=production
PORT=5000
```

### Dashboard (Vite build-time)
```bash
# Hardcoded in src/lib/api.ts:
const API_BASE_URL = 'https://chatbot-lucy-2025.onrender.com/api';
const SOCKET_URL = 'https://chatbot-lucy-2025.onrender.com';
```

### Widget (Hardcoded in chatbot-popup.liquid)
```javascript
const BACKEND_URL = 'https://chatbot-lucy-2025.onrender.com/api';
const SOCKET_URL = 'https://chatbot-lucy-2025.onrender.com';
```

---

## 🔍 Verifica Deploy

### 1. Backend Health Check
```bash
curl https://chatbot-lucy-2025.onrender.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Dashboard Build Hash
```bash
curl -s https://lucine.onrender.com | grep -o 'index-[^"]*\.js'
# Expected: index-Ce3f2x2p.js (or similar hash)
```

### 3. Widget su Shopify
- Vai sul tuo store Shopify
- Apri la pagina di test
- Cerca l'icona del chatbot in basso a destra
- Clicca e verifica che si apra

---

## 📚 Documentazione Tecnica

### Documenti Principali (lucine-production/docs/)
- **OPERATOR_REQUEST_FLOW_FIX.md** - Implementazione flusso operatore
- **CHATBOT_FLOWS_PROFESSIONAL_ANALYSIS.md** - Analisi professionale completa
- **TESTING_SESSION_30_OCT.md** - Scenari di test
- **COMPREHENSIVE_UX_ANALYSIS.md** - Analisi UX completa
- **PROJECT_ONBOARDING.md** - Guida onboarding completa

### API Endpoints Principali

**Public (Widget)**:
- `POST /api/chat/session` - Crea sessione
- `GET /api/chat/session/:id` - Recupera sessione
- `POST /api/chat/session/:id/message` - Invia messaggio utente
- `POST /api/chat/session/:id/request-operator` - Richiedi operatore
- `POST /api/chat/session/:id/cancel-operator-request` - Annulla richiesta

**Protected (Dashboard - richiede JWT)**:
- `GET /api/chat/sessions` - Lista chat
- `POST /api/chat/sessions/:id/accept-operator` - Accetta chat ⭐ NUOVO
- `POST /api/chat/sessions/:id/operator-message` - Invia messaggio operatore
- `POST /api/chat/sessions/:id/close` - Chiudi chat
- `POST /api/chat/sessions/:id/mark-read` - Segna come letto

### WebSocket Events

**Dashboard → Backend**:
- `join_dashboard` - Operator joins dashboard
- `operator_join` - Join operator-specific room
- `join_chat_as_operator` - Join specific chat
- `operator_typing` - Operator is typing

**Backend → Dashboard**:
- `user_message` - New message from user
- `chat_waiting_operator` - Chat waiting for acceptance ⭐ NUOVO
- `chat_accepted` - Chat accepted by operator ⭐ NUOVO
- `operator_joined` - Operator joined chat ⭐ NUOVO
- `chat_closed` - Chat closed

**Widget ↔ Backend**:
- `join_chat` - User joins chat room
- `user_typing` - User is typing
- `operator_message` - Message from operator
- `operator_request_sent` - Request sent to operators ⭐ NUOVO
- `operator_joined` - Operator accepted ⭐ NUOVO
- `operator_request_cancelled` - Request cancelled ⭐ NUOVO

---

## 🐛 Troubleshooting

### Deploy non parte
```bash
# 1. Verifica che il push sia andato a buon fine
git log --oneline -1

# 2. Controlla Render Dashboard
# https://dashboard.render.com
# Cerca il service e guarda i logs

# 3. Se deploy fallisce, leggi i logs
# Build Command failed? Controlla package.json scripts
# Start Command failed? Controlla server entry point
```

### Widget non si aggiorna su Shopify
```bash
# 1. Verifica push
cd /Users/brnobtt/Desktop/lucine-minimal
git log --oneline -1

# 2. Controlla Shopify Admin
# Online Store → Themes → lucine25minimal
# Verifica che sia il theme attivo

# 3. Hard refresh browser
# Cmd + Shift + R (Mac)
# Ctrl + Shift + R (Windows)

# 4. Shopify potrebbe cachare
# Attendi 1-2 minuti e riprova
```

### Database migration issues
```bash
# Se Render non esegue le migration:

# 1. Vai su Render Dashboard
# 2. Apri il Backend service
# 3. Shell tab
# 4. Esegui manualmente:
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## 🎯 Quick Reference

**Push to Production**:
```bash
# Backend/Dashboard
cd /Users/brnobtt/Desktop/lucine-production
git add . && git commit -m "message" && git push origin main

# Widget
cd /Users/brnobtt/Desktop/lucine-minimal
git add . && git commit -m "message" && git push origin main
```

**Rebuild Dashboard**:
```bash
cd /Users/brnobtt/Desktop/lucine-production
npm run build
```

**Restart Backend Locale**:
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend
npm run dev
```

**Database Console**:
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend
npx prisma studio
# Opens on http://localhost:5555
```

---

## 📞 URLs Utili

- **Backend API**: https://chatbot-lucy-2025.onrender.com
- **Dashboard**: https://lucine.onrender.com
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repo 1**: https://github.com/mujians/lucine-chatbot
- **GitHub Repo 2**: https://github.com/mujians/lucine25minimal

---

**Ultima Modifica Importante**: 30 Ottobre 2025 - Implementato flusso professionale di richiesta operatore con stato WAITING
