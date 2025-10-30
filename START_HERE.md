# ⚡ START HERE - Lucine Chatbot

**Leggi questo PRIMA di tutto. 2 minuti.**

---

## 🎯 SITUAZIONE ATTUALE (30 Ott 2025, 23:15)

### ❌ PROBLEMA
Operator request flow NON funziona. Auto-assegnazione senza accettazione.

### ✅ SOLUZIONE PRONTA
Message Table + WAITING state operator flow - **TUTTO GIÀ PREPARATO** in commit c767884

---

## 📂 STRUTTURA REPOSITORY (3 GIT SEPARATI!)

```
/Users/brnobtt/Desktop/
│
├── lucine-production/          # Git: lucine-chatbot (Dashboard)
│   ├── backend/                # ⚠️ Git: chatbot-lucy-2025 (Backend - SEPARATO!)
│   │   ├── src/
│   │   │   ├── controllers/    # ⭐ chat.controller.js
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # ⭐ Database schema
│   │   │   └── migrations/
│   │   └── scripts/
│   │
│   ├── src/                    # Dashboard React
│   │   ├── pages/
│   │   │   └── Index.tsx       # ⭐ Main dashboard
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       └── ChatListPanel.tsx
│   │   └── lib/
│   │       └── api.ts          # ⭐ API client
│   │
│   └── docs/                   # ⚠️ DISORGANIZZATI - da sistemare
│
└── lucine-minimal/             # Git: lucine25minimal (Shopify Widget)
    └── snippets/
        └── chatbot-popup.liquid # ⭐ Widget (2400 righe)
```

---

## 🚨 ERRORI COMUNI DA EVITARE

1. ❌ `cd lucine-production && git push` → **NON deploya backend!**
2. ✅ `cd lucine-production/backend && git push backend main`

3. ❌ Usare JSON per messaggi → Race conditions
4. ✅ Usare Message table (già pronta)

---

## 🎯 COSA FARE ORA (30 minuti)

### Step 1: Recupera Message Table (commit c767884)
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend

# Migration
mkdir -p prisma/migrations/20251029_add_message_table
git show c767884:backend/prisma/migrations/20251029_add_message_table/migration.sql \
  > prisma/migrations/20251029_add_message_table/migration.sql

# Script migrazione dati
git show c767884:backend/scripts/migrate-messages-to-table.js \
  > scripts/migrate-messages-to-table.js
```

### Step 2: Aggiorna Schema
Aggiungi al file `prisma/schema.prisma`:

```prisma
enum MessageType {
  USER
  OPERATOR
  AI
  SYSTEM
}

model Message {
  id          String      @id @default(uuid())
  sessionId   String
  session     ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  type        MessageType
  content     String      @db.Text
  operatorId  String?
  operatorName String?
  aiConfidence Float?
  aiSuggestOperator Boolean @default(false)
  attachmentUrl String?
  attachmentPublicId String?
  attachmentName String?
  attachmentMimetype String?
  attachmentResourceType String?
  attachmentSize Int?
  createdAt   DateTime    @default(now())

  @@index([sessionId])
  @@index([type])
  @@index([createdAt])
  @@index([sessionId, createdAt])
}

// In ChatSession model, aggiungi:
model ChatSession {
  // ... campi esistenti
  messages  Message[]  // ⭐ AGGIUNGI QUESTA RIGA
}
```

### Step 3: Implementa 3 Function
File: `backend/src/controllers/chat.controller.js`

**1. requestOperator** (già esiste, modifica):
```javascript
// Cambia status a WAITING invece di WITH_OPERATOR
status: 'WAITING'

// Emetti eventi corretti
io.to('dashboard').emit('chat_waiting_operator', {...});
io.to(`chat_${sessionId}`).emit('operator_request_sent', {...});
```

**2. acceptOperator** (NUOVO):
```javascript
export const acceptOperator = async (req, res) => {
  // Verifica status === WAITING
  // Usa createMessage() per system message
  const { message } = await createMessage(sessionId, {
    type: 'SYSTEM',
    content: `${operator.name} si è unito alla chat`,
  }, {
    status: 'WITH_OPERATOR',
    operatorId: operatorId,
  });

  // Emit operator_joined, chat_accepted
};
```

**3. cancelOperatorRequest** (NUOVO):
```javascript
export const cancelOperatorRequest = async (req, res) => {
  // Verifica status === WAITING
  // Cambia a ACTIVE
  // Emit chat_request_cancelled
};
```

### Step 4: Aggiungi Routes
File: `backend/src/routes/chat.routes.js`

```javascript
// Import
import { acceptOperator, cancelOperatorRequest } from '../controllers/chat.controller.js';

// Public
router.post('/session/:sessionId/cancel-operator-request', cancelOperatorRequest);

// Protected
router.post('/sessions/:sessionId/accept-operator', authenticateToken, acceptOperator);
```

### Step 5: Deploy
```bash
npx prisma generate
npx prisma migrate deploy
git add .
git commit -m "feat: Message table + WAITING operator flow"
git push backend main
```

---

## 📚 FILE DA LEGGERE (IN ORDINE)

1. **START_HERE.md** ← SEI QUI
2. **PROJECT_CRITICAL_INFO.md** - Info dettagliate git/database/deploy
3. **MESSAGE_TABLE_VS_JSON.md** - Perché Message table
4. **backend/OPERATOR_FLOW_CHANGES_TO_REDO.md** - Codice esatto da implementare

⚠️ **OBSOLETI** (ignorare):
- DEPLOY_INFO.md (sostituito da PROJECT_CRITICAL_INFO.md)
- docs/ vari (da organizzare)

---

## 🔄 DOPO IMPLEMENTAZIONE

### Dashboard (già pronto):
- ✅ ChatListPanel con bottone [Accetta Chat]
- ✅ handleAcceptChat function
- ✅ WebSocket listeners
- ✅ api.ts con acceptOperator()

### Widget (già pronto):
- ✅ showWaitingForOperator() UI
- ✅ cancelOperatorRequest() function
- ✅ WebSocket listeners
- ✅ CSS animazioni

**Deploy**:
```bash
cd /Users/brnobtt/Desktop/lucine-minimal
git push origin main  # Auto-deploy Shopify
```

---

## 📋 ROADMAP PROSSIMI STEP

1. ✅ **Implementa Message table + operator flow** (oggi, 30 min)
2. ⏳ **Organizza documentazione** (domani):
   - Consolidare docs/ in categorie
   - README.md principale
   - Eliminare duplicati
   - Aggiornare obsoleti
3. ⏳ **Testing sistematico** (docs/TESTING_SESSION_30_OCT.md)
4. ⏳ **Ottimizzazioni performance**

---

## 🆘 DEPLOY RAPIDO

**Backend**:
```bash
cd /Users/brnobtt/Desktop/lucine-production/backend
git add . && git commit -m "msg" && git push backend main
```

**Dashboard**:
```bash
cd /Users/brnobtt/Desktop/lucine-production
npm run build && git add . && git commit -m "msg" && git push origin main
```

**Widget**:
```bash
cd /Users/brnobtt/Desktop/lucine-minimal
git add . && git commit -m "msg" && git push origin main
```

---

**Tempo totale**: 30 minuti
**Difficoltà**: Media
**Impatto**: Alto (risolve problema critico)
