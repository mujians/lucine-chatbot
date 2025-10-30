# 🎯 Priorità PRIMA della Roadmap

**Data**: 30 Ottobre 2025, 21:00
**Scopo**: Lista ordinata di cosa fare PRIMA di creare roadmap definitiva

---

## 📋 EXECUTIVE SUMMARY

**Situazione Attuale**:
- ❌ Documentazione (ROADMAP.md) **non affidabile** (feature marcate ✅ ma rotte)
- ❌ Bug critici identificati (operator messages, typing indicator)
- ❓ Molte feature "completate" **mai testate** con utente reale
- ⚠️ User frustrato: "una volta sta merda funzionava"

**Cosa Serve PRIMA della Roadmap**:
1. Fix bugs critici confermati dall'utente
2. Testing reale di feature "completate"
3. Documentazione aggiornata con status VERO
4. Consolidamento docs (rimuovere contraddizioni)

**Dopo questo → Roadmap basata su realtà verificata, non su wishful thinking**

---

## 🔴 FASE 1: FIX BUGS CRITICI (OGGI)

### 1.1 Verificare Fix Operator Messages

**Problema**: User conferma "i messaggi dell'operatore non arrivano all'utente"
**Fix Applicato**: a1911bc (30 Ott, deployed)
**Status User**: "non funziona ancora" (dopo deploy)

**Azioni Immediate**:

```bash
# 1. Verificare deploy completato
curl https://lucine-dashboard.onrender.com/
# Expected: 200 OK

# 2. Check backend logs Render
# Login to Render dashboard → chatbot-lucy-2025 → Logs
# Look for errors during deploy

# 3. Test endpoint diretto (con token valido)
curl -X POST https://chatbot-lucy-2025.onrender.com/api/chat/sessions/{TEST_SESSION_ID}/operator-message \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","operatorId":"test"}'
# Expected: 200 OK o 404 (se route non trovata)

# 4. Check git log remoto
git log origin/main --oneline | head -5
# Verify a1911bc is pushed

# 5. Test live con user
# Operator sends message → User opens widget → Message visible?
```

**Se ancora NON funziona**:
- Controllare se dashboard deploy completato
- Verificare se frontend cache problema (hard refresh)
- Controllare browser console per errori
- Verificare Network tab: POST request sent? Response?

**Deadline**: ⏰ **Stasera** (30 Ott)

---

### 1.2 Debug Typing Indicator

**Problema**: User conferma "non vedo più admin sta scrivendo"
**Situazione**: Codice ✅ corretto in tutti 3 componenti MA runtime ❌ broken

**Azioni Immediate**:

**Step 1: Add Debug Logging (Widget)**
```javascript
// chatbot-popup.liquid - Add after line 2320

socket.on('operator_typing', (data) => {
  console.log('⌨️ TYPING EVENT RECEIVED:', {
    receivedSessionId: data.sessionId,
    currentSessionId: sessionId,
    match: data.sessionId === sessionId,
    isTyping: data.isTyping,
    operatorName: data.operatorName,
    timestamp: new Date().toISOString()
  });

  if (data.sessionId === sessionId) {
    console.log('✅ SessionId matches, calling showTypingIndicator');
    showTypingIndicator(data.isTyping, data.operatorName);

    // Add extra check
    const indicator = document.getElementById('typing-indicator');
    console.log('📍 Typing indicator element:', indicator);
  } else {
    console.error('❌ SessionId mismatch!', {
      expected: sessionId,
      received: data.sessionId
    });
  }
});
```

**Step 2: Test with User**
1. User apre widget
2. Operator inizia a scrivere in dashboard
3. User controlla browser console
4. Cercare log "⌨️ TYPING EVENT RECEIVED"

**Possibili Risultati**:
- ❌ Nessun log → WebSocket non connesso o backend non emette
- ❌ Log ma sessionId mismatch → Bug sincronizzazione IDs
- ❌ Log + match ma indicatore non appare → DOM issue
- ✅ Log + match + indicatore appare → Funziona!

**Step 3: Diagnosi Based on Result**

**Se "Nessun log"**:
→ Backend non emette o widget non in room
```bash
# Check backend logs
# Should see: "⌨️  Operator typing in session {id}: true"
```

**Se "SessionId mismatch"**:
→ Dashboard e Widget hanno sessionId diversi
```javascript
// Dashboard: console.log della sessionId quando emette
console.log('Emitting operator_typing for session:', selectedChat.id);

// Widget: console.log sessionId on init
console.log('Widget sessionId:', sessionId);
```

**Se "DOM issue"**:
→ showTypingIndicator non funziona correttamente
```javascript
// Check if messagesContainer exists
console.log('messagesContainer:', messagesContainer);

// Check if element created
const created = document.getElementById('typing-indicator');
console.log('Indicator created:', created);
```

**Deadline**: ⏰ **31 Ottobre** (domani)

---

### 1.3 Verificare Deploy Backend

**Problema**: Fix routes (5dbe346) e operator messages (a1911bc) deployed?

**Azioni**:
```bash
# 1. Check ultimo commit su Render
# Login Render → chatbot-lucy-2025 → Events
# Verify: "Deploy succeeded" con commit hash a1911bc

# 2. Test endpoint con curl
curl -I https://chatbot-lucy-2025.onrender.com/health
# Expected: 200 OK

# 3. Check routes
curl https://chatbot-lucy-2025.onrender.com/api/chat/sessions
# Expected: 401 Unauthorized (not 404)

# 4. Check operator-message endpoint
curl -X POST https://chatbot-lucy-2025.onrender.com/api/chat/sessions/test/operator-message
# Expected: 401 or 404 (404 = route non esiste)
```

**Se 404 su operator-message**:
→ Route non deployata correttamente
- Verificare file `backend/src/routes/chat.routes.js` su GitHub
- Verificare linea con `/sessions/:sessionId/operator-message`
- Se manca: push mancato, ri-pushare

**Deadline**: ⏰ **Stasera** (30 Ott)

---

## 🟠 FASE 2: TESTING FEATURE "COMPLETATE" (31 Ott - 1 Nov)

### 2.1 Test Checklist - Priority Order

**Test con User Reale** (non simulazioni):

#### Test 1: Operator → User Communication ✅
**Priority**: 🔴 CRITICAL
**Time**: 5 min

**Steps**:
1. User apre widget (new session)
2. User richiede operatore
3. Operator accetta chat
4. Operator scrive messaggio: "Ciao, come posso aiutarti?"
5. **VERIFY**: User vede messaggio nel widget?

**Expected**: ✅ Message appears
**If fails**: 🔴 Ripetere debug operator messages

---

#### Test 2: Typing Indicator Both Ways ⌨️
**Priority**: 🔴 CRITICAL
**Time**: 3 min

**Steps**:
1. User in chat WITH_OPERATOR
2. Operator inizia a scrivere (non invia)
3. **VERIFY**: User vede "Admin sta scrivendo..."?
4. User inizia a scrivere
5. **VERIFY**: Dashboard mostra "User sta scrivendo..."?

**Expected**: ✅ Both indicators work
**If fails**: 🔴 Applicare debug logging (vedi 1.2)

---

#### Test 3: User Resume Session 🔄
**Priority**: 🔴 CRITICAL
**Time**: 5 min

**Steps**:
1. User in chat WITH_OPERATOR
2. User chiude widget (X button)
3. User chiude tab browser completamente
4. User riapre sito (new tab)
5. Widget si apre automaticamente
6. **VERIFY**: Previous messages caricati?
7. User invia nuovo messaggio
8. **VERIFY**: Operator riceve notifica "user resumed chat"?

**Expected**:
- ✅ Messages loaded
- ❌ **NO notification** (non implementato - known issue)

**Note**: Implementare user_resumed_chat notification (P1 priority)

---

#### Test 4: Session Cleared on Chat Close 🧹
**Priority**: 🟠 HIGH
**Time**: 5 min

**Steps**:
1. User in chat WITH_OPERATOR
2. Operator clicca "Close Chat Session"
3. Widget riceve event chat_closed
4. **VERIFY**: Input disabilitato?
5. **VERIFY**: Placeholder = "Chat chiusa"?
6. User chiude e riapre widget
7. **VERIFY**: Nuova sessione creata (sessionId diverso)?

**Expected**: ✅ All checks pass (P11 fix)
**If fails**: 🔴 P11 non funziona

---

#### Test 5: File Upload 📎
**Priority**: 🟡 MEDIUM
**Time**: 5 min

**Steps**:
1. User in chat WITH_OPERATOR
2. User clicca paperclip icon
3. User seleziona immagine (< 10MB)
4. **VERIFY**: Upload progress shown?
5. **VERIFY**: Image appears in widget?
6. **VERIFY**: Operator vede immagine in dashboard?
7. Operator risponde
8. **VERIFY**: Response appare nel widget?

**Expected**: ✅ All checks pass (P0.1 feature)
**If fails**: 🟡 File upload broken

---

#### Test 6: Internal Notes 📝
**Priority**: 🟡 MEDIUM
**Time**: 3 min

**Steps**:
1. Operator apre chat
2. Operator clicca "Internal Notes" button
3. Operator scrive nota: "User needs follow-up"
4. **VERIFY**: Nota salvata?
5. Operator ricarica pagina
6. **VERIFY**: Nota ancora visibile?
7. User controlla widget
8. **VERIFY**: Nota NON visibile a user?

**Expected**: ✅ All checks pass (P0.3 feature)
**If fails**: 🟡 Internal notes broken

---

#### Test 7: User History 📚
**Priority**: 🟡 MEDIUM
**Time**: 3 min

**Steps**:
1. User con multiple conversazioni passate
2. Operator apre chat
3. Operator clicca "History" icon
4. **VERIFY**: Modal apre con lista sessioni?
5. **VERIFY**: Mostra data, status, preview ultimo messaggio?
6. Operator clicca su conversazione passata
7. **VERIFY**: Messaggi vecchi caricati?

**Expected**: ✅ All checks pass (P0.2 feature)
**If fails**: 🟡 User history broken

---

#### Test 8: Convert to Ticket 🎫
**Priority**: 🟡 MEDIUM
**Time**: 5 min

**Steps**:
1. User in chat WITH_OPERATOR
2. Operator clicca "Convert to Ticket"
3. Operator compila form (WhatsApp number, notes)
4. Operator invia
5. **VERIFY**: Ticket creato?
6. **VERIFY**: Chat chiusa automaticamente?
7. Operator va a Tickets page
8. **VERIFY**: Ticket appare nella lista?
9. **VERIFY**: Include transcript completo chat?

**Expected**: ✅ All checks pass
**If fails**: 🟡 Convert to ticket broken

---

### 2.2 Risultati Testing → Update Docs

**Dopo ogni test**, aggiornare:

**docs/TEST_RESULTS.md** (nuovo file):
```markdown
# Test Results - [Date]

## Test 1: Operator → User Communication
- **Status**: ✅ PASS / ❌ FAIL
- **Details**: ...
- **Screenshots**: [link]

## Test 2: Typing Indicator
- **Status**: ✅ PASS / ❌ FAIL
- **Details**: ...
```

**docs/CURRENT_STATUS.md** - Aggiungere sezione:
```markdown
## Testing Session - 31 Ottobre 2025

### Verified Working ✅
- Operator messages to user (fix a1911bc)
- File upload (P0.1)
- Internal notes (P0.3)

### Verified Broken ❌
- Typing indicator (runtime issue)
- User resume notification (not implemented)

### Needs More Testing ❓
- Session cleared on close (P11)
- Dashboard real-time (P12)
```

---

## 🟡 FASE 3: FIX BUGS IDENTIFICATI (1-2 Nov)

### 3.1 Implementare User Resume Notification

**Priority**: 🟠 HIGH
**Time**: 1 ora

**Backend** - `backend/src/controllers/chat.controller.js`:
```javascript
// In getSession function (around line 81-123)
export const getSession = async (req, res) => {
  // ... existing code ...

  const session = await prisma.chatSession.findUnique({...});

  if (!session) {
    return res.status(404).json({...});
  }

  // ✅ NEW: Notify operator if user resumes active session
  if (session.status === 'WITH_OPERATOR' && session.operatorId) {
    io.to(`operator_${session.operatorId}`).emit('user_resumed_chat', {
      sessionId: session.id,
      userName: session.userName,
      timestamp: new Date().toISOString(),
    });
    console.log(`🔔 User resumed chat: ${session.id} → Operator ${session.operatorId}`);
  }

  res.json({ success: true, data: session });
};
```

**Dashboard** - `src/pages/Index.tsx` (add listener):
```typescript
// In useEffect with socket listeners (around line 80-100)
socket.on('user_resumed_chat', (data: { sessionId: string; userName: string }) => {
  console.log('🔔 User resumed chat:', data);

  // Refresh chat list to show activity
  fetchChats();

  // Optional: Show toast notification
  // toast.info(`${data.userName} è tornato nella chat`);
});
```

**Testing**:
1. User apre widget (sessionId esistente)
2. Verificare backend log: "🔔 User resumed chat"
3. Verificare dashboard riceve event
4. Verificare chat list refreshata

**Commit**: "feat: Add user resume chat notification (P0.X)"

---

### 3.2 Fix Typing Indicator (Based on Test Results)

**Priority**: 🔴 CRITICAL
**Time**: 2-4 ore (depends on issue found)

**Azioni**: Based on risultati test 1.2 (debug logging)

**Possible Fixes**:

**Fix A: SessionId Mismatch**
```javascript
// Ensure dashboard and widget use same sessionId format
// Check: UUID vs integer vs string
```

**Fix B: Widget Not in Room**
```javascript
// Widget must emit join_chat AFTER socket connected
socket.on('connect', () => {
  console.log('✅ Socket connected');
  if (sessionId) {
    socket.emit('join_chat', { sessionId });
  }
});
```

**Fix C: Timeout Too Aggressive**
```typescript
// Dashboard: Increase timeout from 1s to 2s
setTimeout(() => {
  socket.emit('operator_typing', {
    sessionId,
    operatorName,
    isTyping: false,
  });
}, 2000); // Was 1000
```

**Commit**: "fix: Typing indicator - [specific issue]"

---

### 3.3 Implementare Unread Badges Tracking

**Priority**: 🟡 MEDIUM
**Time**: 2-3 ore

**Backend** - Prisma Schema:
```prisma
model ChatSession {
  // ... existing fields ...
  unreadCount  Int @default(0)
}
```

**Backend** - Increment on new message:
```javascript
// In sendMessage controller
await prisma.chatSession.update({
  where: { id: sessionId },
  data: {
    messages: JSON.stringify(messages),
    lastMessageAt: new Date(),
    unreadCount: { increment: 1 }, // ✅ NEW
  },
});
```

**Backend** - Reset on mark-read:
```javascript
// In markMessagesAsRead controller
await prisma.chatSession.update({
  where: { id: sessionId },
  data: {
    unreadCount: 0, // ✅ NEW
  },
});
```

**Dashboard** - Show badge:
```typescript
// TopBar.tsx - calculate total unread
const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

<TopBar unreadCount={totalUnread} />
```

**Testing**:
1. User invia 3 messaggi
2. Verificare unreadCount = 3
3. Operator apre chat
4. Verificare badge mostra "3"
5. Operator clicca (mark as read)
6. Verificare badge scompare

**Commit**: "feat: Add unread message badges tracking"

---

## 🟢 FASE 4: WIDGET SETTINGS INTEGRATION (3-4 Nov)

### 4.1 Backend: Public Widget Settings Endpoint

**Priority**: 🟡 MEDIUM
**Time**: 1 ora

**File**: `backend/src/controllers/settings.controller.js`
```javascript
export const getWidgetPublicSettings = async (req, res) => {
  const publicKeys = [
    'widgetHeaderColor',
    'widgetUserBalloonColor',
    'widgetOperatorBalloonColor',
    // ... all 28 widget settings
  ];

  const settings = await prisma.systemSettings.findMany({
    where: { key: { in: publicKeys } },
    select: { key: true, value: true },
  });

  const settingsObj = {};
  settings.forEach(s => {
    settingsObj[s.key] = s.value;
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ success: true, data: settingsObj });
};
```

**Route**: `backend/src/routes/settings.routes.js`
```javascript
router.get('/widget-public', getWidgetPublicSettings); // NO auth
```

**Testing**:
```bash
curl https://chatbot-lucy-2025.onrender.com/api/settings/widget-public
# Expected: { success: true, data: { widgetHeaderColor: "#dc2626", ... } }
```

---

### 4.2 Widget: Fetch and Use Settings

**File**: `chatbot-popup.liquid`
```javascript
let WIDGET_SETTINGS = {};

async function loadWidgetSettings() {
  try {
    const response = await fetch('https://chatbot-lucy-2025.onrender.com/api/settings/widget-public');
    const data = await response.json();
    WIDGET_SETTINGS = data.data || {};
    console.log('✅ Widget settings loaded');
  } catch (error) {
    console.error('Failed to load widget settings:', error);
    // Use hardcoded defaults
  }
}

// Use settings
const greeting = WIDGET_SETTINGS.widgetGreeting || 'Ciao! Come posso aiutarti?';
addMessage(greeting, 'ai');
```

**Testing**:
1. Change "widgetGreeting" in Settings page
2. Save
3. Refresh widget
4. Verify new greeting appears

---

## 📊 FASE 5: CONSOLIDAMENTO DOCS (5 Nov)

### 5.1 Update CURRENT_STATUS.md

Aggiungere sezioni:
- Testing Results (31 Ott - 2 Nov)
- Verified Working Features
- Verified Broken Features
- Fixes Applied (3-4 Nov)

### 5.2 Archiviare Docs Obsoleti

**Move to docs/archive/**:
- ROADMAP.md (obsoleto)
- ISSUES_FOUND.md (se esiste)
- QA_FINDINGS.md (vecchio)

### 5.3 Creare VERIFIED_STATUS.md

Nuovo documento con:
```markdown
# Verified Status - [Date]

## ✅ WORKING (User Tested)
- Feature 1
- Feature 2

## ❌ BROKEN (Confirmed)
- Feature X
- Feature Y

## ❓ UNTESTED
- Feature Z
```

---

## 🎯 FASE 6: ROADMAP REWRITE (6 Nov)

**SOLO DOPO tutto quanto sopra completato**

### 6.1 Roadmap Structure

```markdown
# Lucine Chatbot - Roadmap

## Current Status (Verified: 6 Nov 2025)

### ✅ Working Features
[Lista basata su testing reale]

### ❌ Known Issues
[Lista bugs confermati]

### 🔧 In Progress
[Fixes in development]

## Next Sprint (7-14 Nov)

### P0 - Critical
[Only real critical bugs]

### P1 - High
[Important but not blocking]

### P2 - Medium
[Nice to have]

## Future (14+ Nov)

### New Features
[Proposed enhancements]
```

### 6.2 Roadmap Principles

**NO feature marked ✅ unless**:
1. Code committed to Git
2. Deployed to production
3. Tested with real user
4. User confirms working

**Status Indicators**:
- ✅ **WORKING** - User tested, confirmed
- 🟢 **DEPLOYED** - Live, awaiting test
- 🟡 **IN PROGRESS** - Being developed
- ⚠️ **BROKEN** - Implemented but not working
- ❌ **BLOCKED** - Cannot proceed
- ❓ **UNTESTED** - Unknown status

---

## 📅 TIMELINE RIASSUNTIVO

| Fase | Tasks | Deadline | Status |
|------|-------|----------|--------|
| **FASE 1** | Fix bugs critici | 30-31 Ott | 🟡 In progress |
| **FASE 2** | Testing feature | 31 Ott - 1 Nov | ⏳ Pending |
| **FASE 3** | Fix bugs identificati | 1-2 Nov | ⏳ Pending |
| **FASE 4** | Widget settings | 3-4 Nov | ⏳ Pending |
| **FASE 5** | Consolidamento docs | 5 Nov | ⏳ Pending |
| **FASE 6** | Roadmap rewrite | 6 Nov | ⏳ Pending |

**Total**: ~7 giorni per avere roadmap affidabile basata su realtà verificata.

---

## ✅ CHECKLIST FINALE

### Prima di creare Roadmap, verificare:

- [ ] Operator messages funzionano (user confirmed)
- [ ] Typing indicator funziona (user confirmed)
- [ ] File upload testato end-to-end
- [ ] Internal notes testate end-to-end
- [ ] User history testata end-to-end
- [ ] Convert to ticket testato end-to-end
- [ ] Session persistence testata
- [ ] User resume notification implementata
- [ ] Unread badges implementate
- [ ] Widget settings integration implementata
- [ ] TEST_RESULTS.md creato con tutti i risultati
- [ ] CURRENT_STATUS.md aggiornato
- [ ] Docs obsoleti archiviati
- [ ] VERIFIED_STATUS.md creato

**SOLO dopo tutti questi ✅ → Procedere con Roadmap**

---

**Conclusione**: La roadmap sarà accurata e utile SOLO se basata su testing reale e status verificato. Rushing to roadmap now = ripetere errori passati (feature marked ✅ but broken).

**Tempo stimato**: ~1 settimana di lavoro metodico per avere fundation solida.

**ROI**: Roadmap affidabile → Planning accurato → Meno sorprese → User soddisfatto.
