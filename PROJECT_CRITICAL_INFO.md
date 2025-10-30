# 🔴 PROJECT CRITICAL INFO - READ THIS FIRST

**⚠️ IMPORTANTE: Leggi questo file OGNI VOLTA che riprendi il progetto dopo perdita di memoria**

**Last Updated**: 30 Ottobre 2025, 22:30

---

## 🎯 COSA STAI FACENDO

Stai lavorando su **Lucine Chatbot** - un sistema di customer support AI con operatori umani per un parco a tema in Italia.

**Componenti**:
1. **Backend** (Node.js + Express + Prisma + PostgreSQL)
2. **Dashboard** (React + TypeScript - operatori)
3. **Widget** (Vanilla JS - utenti sul sito Shopify)

---

## 📂 STRUTTURA GIT - ATTENZIONE!

### ⚠️ CRITICAL: CI SONO 3 REPOSITORY GIT SEPARATI

```
Desktop/
│
├── lucine-production/
│   ├── .git/                           # Git Repo Principale
│   │   └── remotes:
│   │       ├── origin → lucine-chatbot     (Dashboard + docs)
│   │       └── (NON il backend!)
│   │
│   ├── backend/                        # ⚠️ ATTENZIONE: Ha il SUO git!
│   │   └── .git/
│   │       └── remotes:
│   │           ├── origin → lucine-chatbot     (SBAGLIATO - non usare!)
│   │           └── backend → chatbot-lucy-2025  (✅ CORRETTO - usa questo!)
│   │
│   ├── src/                            # Dashboard React
│   └── docs/                           # Documentazione
│
└── lucine-minimal/                     # Shopify Theme
    └── .git/
        └── remote: lucine25minimal
```

### 🔗 Repository GitHub

| Repository | GitHub URL | Deploy Target | Path Locale |
|------------|-----------|---------------|-------------|
| `lucine-chatbot` | https://github.com/mujians/lucine-chatbot | Dashboard su Render | `/Users/brnobtt/Desktop/lucine-production` (root) |
| `chatbot-lucy-2025` | https://github.com/mujians/chatbot-lucy-2025 | Backend su Render | `/Users/brnobtt/Desktop/lucine-production/backend` |
| `lucine25minimal` | https://github.com/mujians/lucine25minimal | Shopify Theme | `/Users/brnobtt/Desktop/lucine-minimal` |

---

## 🚨 ERRORE COMUNE - LEGGI QUESTO!

### ❌ COSA NON FARE:
```bash
cd /Users/brnobtt/Desktop/lucine-production
git push origin main  # ❌ Questo NON deploya il backend!
```

### ✅ COSA FARE:

**Per Backend**:
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend
git status                    # Verifica modifiche
git add .
git commit -m "message"
git push backend main         # ✅ CORRETTO - deploya su Render
```

**Per Dashboard**:
```bash
cd /Users/brnobtt/Desktop/lucine-production
npm run build                 # Build prima
git add .
git commit -m "message"
git push origin main          # ✅ Deploya dashboard su Render
```

**Per Widget**:
```bash
cd /Users/brnobtt/Desktop/lucine-minimal
git add snippets/chatbot-popup.liquid
git commit -m "message"
git push origin main          # ✅ Auto-deploya su Shopify
```

---

## 🗄️ DATABASE SCHEMA - IMPORTANTE!

### ⚠️ Message Table Refactoring (BUG #6 - Completato)

Il backend USA una **tabella Message separata**, NON più JSON!

**VECCHIO CODICE (❌ NON USARE)**:
```javascript
const messages = JSON.parse(session.messages || '[]');
messages.push({ id: Date.now(), type: 'user', content: 'hello' });
await prisma.chatSession.update({
  where: { id: sessionId },
  data: { messages: JSON.stringify(messages) }
});
```

**NUOVO CODICE (✅ USARE SEMPRE)**:
```javascript
// Singolo messaggio
const { message } = await createMessage(sessionId, {
  type: 'user',
  content: 'hello',
  operatorId: null,
  operatorName: null
});

// Multipli messaggi
const { messages } = await createMessages(sessionId, [
  { type: 'user', content: 'hello' },
  { type: 'system', content: 'Welcome' }
]);
```

**Helper Functions (già presenti in chat.controller.js)**:
- `createMessage(sessionId, messageData, additionalSessionData)`
- `createMessages(sessionId, messagesData, additionalSessionData)`

### Database Tables

**ChatSession**:
```prisma
model ChatSession {
  id              String      @id @default(uuid())
  userId          String?
  userName        String?
  userEmail       String?
  status          ChatStatus  @default(ACTIVE)
  operatorId      String?
  operator        Operator?   @relation(fields: [operatorId])
  messages        Message[]   // ✅ Relazione, non JSON!
  createdAt       DateTime    @default(now())
  lastMessageAt   DateTime?
  closedAt        DateTime?
  // ... altri campi
}
```

**Message** (✅ NUOVA - usare questa!):
```prisma
model Message {
  id                      String      @id @default(uuid())
  sessionId               String
  session                 ChatSession @relation(fields: [sessionId])
  type                    MessageType // USER, AI, OPERATOR, SYSTEM
  content                 String
  operatorId              String?
  operatorName            String?
  aiConfidence            Float?
  aiSuggestOperator       Boolean     @default(false)
  attachmentUrl           String?
  attachmentPublicId      String?
  attachmentName          String?
  attachmentMimetype      String?
  attachmentResourceType  String?
  attachmentSize          Int?
  createdAt               DateTime    @default(now())
}
```

---

## 🔄 STATI DELLA CHAT

```
ChatStatus enum:
- ACTIVE              // Chat con AI
- WAITING             // ✅ In attesa di operatore (da implementare)
- WITH_OPERATOR       // Con operatore umano
- CLOSED              // Chiusa
- TICKET_CREATED      // Convertita in ticket
```

---

## 📡 WEBSOCKET EVENTS - REFERENCE

### Dashboard → Backend
- `join_dashboard` - Operator entra dashboard
- `operator_join` - Operator si unisce alla sua room
- `join_chat_as_operator` - Operator apre una chat specifica
- `operator_typing` - Operator sta scrivendo

### Backend → Dashboard
- `user_message` - Nuovo messaggio da utente
- `new_chat_request` - Nuova richiesta chat (deprecato?)
- `chat_assigned` - Chat assegnata (da cambiare con chat_waiting_operator)
- `chat_closed` - Chat chiusa
- `operator_message` - Echo messaggio operatore

### Widget ↔ Backend
- `join_chat` - User si unisce alla chat
- `user_typing` - User sta scrivendo
- `operator_message` - Messaggio da operatore
- `operator_typing` - Operatore sta scrivendo
- `chat_closed` - Chat chiusa

### ⚠️ EVENTI DA IMPLEMENTARE (Operator Request Flow):
- `chat_waiting_operator` - Backend → Dashboard (nuova richiesta)
- `operator_request_sent` - Backend → Widget (conferma richiesta inviata)
- `operator_joined` - Backend → Widget + Dashboard (operatore accettato)
- `chat_accepted` - Backend → Dashboard (operatore ha accettato)
- `chat_request_cancelled` - Backend → Dashboard + Widget (richiesta cancellata)

---

## 🎯 TASK IN CORSO (30 Ottobre 2025)

### ✅ OBIETTIVO PRINCIPALE
Implementare **flusso professionale richiesta operatore** con stato WAITING.

### ❌ PROBLEMA SCOPERTO
Abbiamo lavorato su codice VECCHIO (JSON messages) mentre su `backend/main` il codice usa **Message table** (refactoring BUG #6).

### 📝 FUNZIONI AGGIUNTE OGGI (DA RIFARE CON Message TABLE)

**Backend (chat.controller.js)**:

1. **cancelOperatorRequest** (NUOVO - linee 327-391)
```javascript
export const cancelOperatorRequest = async (req, res) => {
  // User cancella richiesta operatore
  // Cambia status: WAITING → ACTIVE
  // Emit: chat_request_cancelled
}
```

2. **acceptOperator** (NUOVO - linee 393-448)
```javascript
export const acceptOperator = async (req, res) => {
  // Operator accetta chat in WAITING
  // Cambia status: WAITING → WITH_OPERATOR
  // ⚠️ USA JSON: messages.push({ type: 'system', content: '...' })
  // 🔧 DEVE USARE: await createMessage(sessionId, { type: 'system', ... })
  // Emit: operator_joined, chat_accepted
}
```

3. **requestOperator** (MODIFICATO - linee 274-318)
```javascript
// PRIMA: Assegnava subito operatore (status = WITH_OPERATOR)
// DOPO: Mette in attesa (status = WAITING)
// ⚠️ Non aggiunge più messaggi (corretto)
// Emit: chat_waiting_operator, operator_request_sent
```

**Routes (chat.routes.js)**:
```javascript
// Protected
router.post('/sessions/:sessionId/accept-operator', authenticateToken, acceptOperator);

// Public
router.post('/session/:sessionId/cancel-operator-request', cancelOperatorRequest);
```

---

## 📋 CHECKLIST PRIMA DI MODIFICARE BACKEND

Prima di modificare `backend/src/controllers/chat.controller.js`:

1. ✅ **Sei nella directory giusta?**
   ```bash
   pwd
   # Output: /Users/brnobtt/Desktop/lucine-production/backend
   ```

2. ✅ **Hai fatto git fetch?**
   ```bash
   git fetch backend
   git log backend/main -5 --oneline  # Vedi ultimi commit
   ```

3. ✅ **Sei sul branch corretto?**
   ```bash
   git branch  # Dovrebbe essere 'main'
   git status  # Verifica stato
   ```

4. ✅ **Hai letto il codice esistente?**
   ```bash
   # Verifica che usi createMessage, non JSON
   grep -n "createMessage" backend/src/controllers/chat.controller.js
   ```

5. ✅ **Sai quale remote pushare?**
   ```bash
   git remote -v
   # backend	https://github.com/mujians/chatbot-lucy-2025.git ← QUESTO!
   ```

---

## 🔧 WORKFLOW CORRETTO PER MODIFICHE BACKEND

```bash
# 1. Vai nella directory backend
cd /Users/brnobtt/Desktop/lucine-production/backend

# 2. Fetch ultimo codice
git fetch backend

# 3. Se hai modifiche locali non committate, salvale
git stash

# 4. Allineati con backend/main
git reset --hard backend/main
# ⚠️ Questo cancella modifiche locali! Usa solo se sai cosa fai

# 5. Crea branch di lavoro (opzionale ma raccomandato)
git checkout -b feature/operator-waiting-state

# 6. Fai modifiche (usando createMessage!)
# ... modifica file ...

# 7. Testa locale
cd ..  # Torna a lucine-production
cd backend && npm run dev

# 8. Commit
git add .
git commit -m "feat: description"

# 9. Push sul remote CORRETTO
git push backend feature/operator-waiting-state
# Oppure se sei su main:
git push backend main

# 10. Verifica deploy su Render
# https://dashboard.render.com → chatbot-lucy-2025
```

---

## 🧪 TESTING LOCALE

### Backend
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend
npm run dev
# http://localhost:5000
```

### Dashboard
```bash
cd /Users/brnobtt/Desktop/lucine-production
npm run dev
# http://localhost:5173
```

### Database GUI
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend
npx prisma studio
# http://localhost:5555
```

---

## 📚 FILE CHIAVE

### Backend
- `backend/src/controllers/chat.controller.js` - ⭐ MAIN FILE
- `backend/src/routes/chat.routes.js` - API routes
- `backend/src/services/websocket.service.js` - WebSocket events
- `backend/prisma/schema.prisma` - Database schema

### Dashboard
- `src/pages/Index.tsx` - ⭐ Main dashboard page
- `src/components/dashboard/ChatListPanel.tsx` - Chat list
- `src/lib/api.ts` - API client

### Widget
- `/Users/brnobtt/Desktop/lucine-minimal/snippets/chatbot-popup.liquid` - ⭐ Tutto il widget (2400 righe)

---

## 🚨 RED FLAGS - QUANDO FERMARTI

**FERMATI E CHIEDI se vedi**:
1. ❌ `messages = JSON.parse(session.messages)` nel backend
2. ❌ Push che va su `origin` invece di `backend` (per backend)
3. ❌ Commit che modificano `prisma/schema.prisma` senza migration
4. ❌ Force push su repository condivisi
5. ❌ Modifiche a file in `backend/` senza essere in quella directory

---

## 💡 COMANDI UTILI RAPIDI

**Verifica dove sei**:
```bash
pwd && git remote -v | grep -E "^(origin|backend)\s"
```

**Verifica deploy hash dashboard**:
```bash
curl -s https://lucine.onrender.com | grep -o 'index-[^"]*\.js'
```

**Verifica backend health**:
```bash
curl https://chatbot-lucy-2025.onrender.com/health
```

**Lista branch con remote tracking**:
```bash
git branch -vv
```

---

## 📖 DOCUMENTAZIONE IMPORTANTE

**LEGGI QUESTI FILE prima di modifiche grandi**:
1. `PROJECT_CRITICAL_INFO.md` ← QUESTO FILE
2. `DEPLOY_INFO.md` - Info deploy e repository
3. `docs/OPERATOR_REQUEST_FLOW_FIX.md` - Implementazione WAITING state
4. `docs/CHATBOT_FLOWS_PROFESSIONAL_ANALYSIS.md` - Analisi professionale
5. `backend/README.md` - Setup backend (se esiste)

---

## 🎯 OBIETTIVO CORRENTE (DA COMPLETARE)

**Task**: Implementare operator request flow professionale

**Status**: ❌ IN CORSO - Codice scritto su versione vecchia, da riscrivere

**Prossimi Step**:
1. ✅ Salvare modifiche fatte oggi
2. ✅ Checkout backend/main pulito
3. ✅ Riscrivere `acceptOperator` con `createMessage()`
4. ✅ Riscrivere `cancelOperatorRequest` (non usa messaggi, ok)
5. ✅ Verificare `requestOperator` modifiche
6. ✅ Test locale
7. ✅ Push su `backend` remote
8. ✅ Verifica deploy

---

## ⚙️ ENVIRONMENT VARIABLES

**Backend** (.env in backend/):
- `DATABASE_URL` - PostgreSQL su Render
- `JWT_SECRET` - Token secret
- `OPENAI_API_KEY` - OpenAI key
- `CORS_ORIGIN` - https://lucine.onrender.com
- `NODE_ENV` - production
- `PORT` - 5000

**Dashboard** (hardcoded in src/lib/api.ts):
- API: https://chatbot-lucy-2025.onrender.com/api
- Socket: https://chatbot-lucy-2025.onrender.com

**Widget** (hardcoded in chatbot-popup.liquid):
- BACKEND_URL: https://chatbot-lucy-2025.onrender.com/api
- SOCKET_URL: https://chatbot-lucy-2025.onrender.com

---

## 🆘 IN CASO DI DISASTRO

**Rollback Backend**:
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend
git fetch backend
git reset --hard backend/main
git push backend main --force
```

**Rollback Dashboard**:
```bash
cd /Users/brnobtt/Desktop/lucine-production
git fetch origin
git reset --hard origin/main
git push origin main --force
```

**Contatta l'utente** se:
- Devi fare force push
- Devi modificare schema database
- Vedi conflitti che non capisci
- Deploy fallisce più di 2 volte

---

**ULTIMA MODIFICA**: 30 Ottobre 2025, 22:30
**PROSSIMA REVIEW**: Dopo completamento operator flow
