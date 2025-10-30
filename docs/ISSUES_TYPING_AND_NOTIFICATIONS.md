# Issues: Typing Indicator & Notifications Analysis

**Data**: 30 Ottobre 2025, ore 20:15
**Analisi**: Sistema typing indicator e notifiche operatore

---

## 🔴 PROBLEMI RIPORTATI DALL'UTENTE

### 1. Typing Indicator Non Funziona
**Sintomo**: "Non vedo più admin sta scrivendo"
**Quando**: Operatore scrive nella dashboard → utente non vede indicatore typing nel widget

### 2. Errore 404 Persistente
**Sintomo**: `chatbot-lucy-2025.onrender.com/api/chat/sessions/.../mark-read:1 Failed to load resource: 404`
**Causa**: Deploy backend non ancora completato (fix pushed ma Render sta ancora deployando)

### 3. WebSocket Disconnessioni
**Sintomo**:
```
✅ WebSocket connected
❌ WebSocket disconnected
✅ WebSocket connected
```

### 4. Nessuna Notifica Quando Utente Riprende Chat
**Sintomo**: Utente riapre widget con sessione esistente (operatore già assegnato) → operatore non riceve notifica

---

## 🔍 ANALISI TECNICA

### Sistema Typing Indicator

#### Backend (websocket.service.js)

✅ **Corretto** - Backend gestisce typing events:
```javascript
// Lines 60-70
socket.on('operator_typing', (data) => {
  const { sessionId, operatorName, isTyping } = data;
  // Notify user in the chat room
  socket.to(`chat_${sessionId}`).emit('operator_typing', {
    sessionId,
    operatorName,
    isTyping,
  });
  console.log(`⌨️  Operator typing in session ${sessionId}: ${isTyping}`);
});
```

#### Dashboard ChatWindow (ChatWindow.tsx)

✅ **Corretto** - Dashboard emette operator_typing:
```typescript
// Lines 226-245
socket.emit('operator_typing', {
  sessionId: selectedChat.id,
  operatorName: currentOperator?.name || 'Operatore',
  isTyping: true,
});

// Stop typing after 1 second of inactivity
typingTimeoutRef.current = setTimeout(() => {
  socket.emit('operator_typing', {
    sessionId: selectedChat.id,
    operatorName: currentOperator?.name || 'Operatore',
    isTyping: false,
  });
}, 1000);
```

#### Widget (chatbot-popup.liquid)

✅ **Corretto** - Widget ascolta operator_typing:
```javascript
// Line 2320-2324
socket.on('operator_typing', (data) => {
  if (data.sessionId === sessionId) {
    showTypingIndicator(data.isTyping, data.operatorName);
  }
});
```

✅ **Corretto** - Funzione showTypingIndicator implementata:
```javascript
// Lines 1299-1329
function showTypingIndicator(isTyping, operatorName) {
  const existingIndicator = document.getElementById('typing-indicator');

  if (isTyping) {
    if (!existingIndicator) {
      const indicator = document.createElement('div');
      indicator.id = 'typing-indicator';
      indicator.className = 'chat-message operator-message';
      indicator.innerHTML = `
        <div class="message-content">
          <span>${operatorName || 'Operatore'} sta scrivendo</span>
          <div style="display: flex; gap: 4px;">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      messagesContainer.appendChild(indicator);
    }
  } else {
    if (existingIndicator) {
      existingIndicator.remove();
    }
  }
}
```

---

## 🐛 PROBLEMI IDENTIFICATI

### Problema 1: Widget Non Nella Room Corretta

**Root Cause Possibile**:
Il widget deve essere nella room `chat_${sessionId}` per ricevere l'evento `operator_typing`.

**Verifica join_chat**:
```javascript
// Widget - Lines 2254-2261
socket.emit('join_chat', { sessionId: sessionId });
console.log('📤 Emitted join_chat with sessionId:', sessionId);
```

✅ Widget emette `join_chat` correttamente

**Backend websocket.service.js**:
```javascript
// Lines 34-39
socket.on('join_chat', (data) => {
  const { sessionId } = data;
  socket.join(`chat_${sessionId}`);
  console.log(`💬 Joined chat session: ${sessionId}`);
});
```

✅ Backend gestisce `join_chat` correttamente

**POSSIBILE CAUSA**:
- Widget emette `join_chat` PRIMA che socket sia completamente connesso?
- SessionId non sincronizzato tra dashboard e widget?
- Operatore non nella stessa chat room quando emette typing?

---

### Problema 2: Dashboard Non Join Chat Room

**CRITICAL ISSUE FOUND**:

Dashboard ChatWindow emette `operator_typing` ma **NON emette `join_chat`**!

**Verifica ChatWindow.tsx**:
```typescript
// Lines 41-46
newSocket.emit('operator_join', { operatorId: operatorId });
newSocket.emit('join_chat', { sessionId: chat.id }); // ✅ PRESENTE!
```

✅ **CORRETTO**: Dashboard emette `join_chat` (linea 42)

---

### Problema 3: User Resume Session - No Notification

**Root Cause**:
Quando l'utente riapre il widget con sessionId salvato in localStorage:

1. Widget chiama `GET /api/chat/session/:sessionId` (getSession)
2. Backend ritorna sessione
3. **NON viene emessa NESSUNA notifica all'operatore**

**Codice Backend (chat.controller.js)**:
```javascript
// Lines 81-123 - getSession
export const getSession = async (req, res) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: { operator: {...}, user: {...} }
  });

  res.json({ success: true, data: session });

  // ❌ NO NOTIFICATION TO OPERATOR!
}
```

**Impatto**:
- Operatore vede chat come "inactive"
- Operatore non sa che utente è tornato
- Non c'è badge/notifica "user resumed chat"

---

### Problema 4: WebSocket Disconnessioni

**Possibili Cause**:
1. **Render Free Tier**: Cold starts / sleep dopo inattività
2. **Network issues**: Timeout CloudFlare/Render
3. **Socket.IO misconfiguration**: Ping/pong timeout
4. **Multiple socket connections**: Widget crea socket duplicati

**Da Verificare**:
- Backend socket.io configuration (pingTimeout, pingInterval)
- Widget reconnection logic
- Render logs per vedere disconnessioni lato server

---

## ✅ SOLUZIONI PROPOSTE

### Fix 1: Add User Resume Notification

**File**: `backend/src/controllers/chat.controller.js`

**Modificare getSession** per emettere notifica se sessione WITH_OPERATOR:

```javascript
export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        operator: {
          select: { id: true, name: true, email: true },
        },
        user: {
          select: { id: true, name: true, email: true, totalChats: true, firstSeenAt: true, lastSeenAt: true },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        error: { message: 'Session not found' },
      });
    }

    // ✅ NEW: Notify operator if user resumes active session
    if (session.status === 'WITH_OPERATOR' && session.operatorId) {
      io.to(`operator_${session.operatorId}`).emit('user_resumed_chat', {
        sessionId: session.id,
        userName: session.userName,
        timestamp: new Date().toISOString(),
      });
      console.log(`🔔 User resumed chat: ${sessionId} → Notified operator ${session.operatorId}`);
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: { message: 'Internal server error' },
    });
  }
};
```

---

### Fix 2: Add Dashboard Listener for user_resumed_chat

**File**: `src/components/dashboard/ChatList.tsx`

Aggiungere listener per mostrare badge/notifica:

```typescript
useEffect(() => {
  if (!socket) return;

  // Existing listeners...
  socket.on('new_chat_created', handleNewChat);
  socket.on('chat_assigned', handleChatAssigned);

  // ✅ NEW: Listen for user resumed chat
  socket.on('user_resumed_chat', (data: { sessionId: string; userName: string }) => {
    console.log('🔔 User resumed chat:', data);
    // Refresh chat list to show updated badge/indicator
    fetchChats();

    // Optional: Show toast notification
    // toast.info(`${data.userName} è tornato nella chat`);
  });

  return () => {
    socket.off('user_resumed_chat');
  };
}, [socket]);
```

---

### Fix 3: Debug Typing Indicator

**Aggiungi logging nel widget** per diagnosticare perché typing non funziona:

**File**: `lucine-minimal/snippets/chatbot-popup.liquid`

```javascript
// After line 2320
socket.on('operator_typing', (data) => {
  console.log('⌨️ Received operator_typing event:', {
    receivedSessionId: data.sessionId,
    currentSessionId: sessionId,
    match: data.sessionId === sessionId,
    isTyping: data.isTyping,
    operatorName: data.operatorName
  });

  if (data.sessionId === sessionId) {
    console.log('✅ SessionId matches, calling showTypingIndicator');
    showTypingIndicator(data.isTyping, data.operatorName);
  } else {
    console.log('❌ SessionId mismatch!');
  }
});
```

---

### Fix 4: Investigate WebSocket Disconnections

**Backend**: Verificare configurazione Socket.IO

**File**: `backend/src/server.js`

Cercare configurazione socket.io e verificare:
```javascript
const io = new Server(server, {
  cors: { origin: '*', credentials: true },
  pingTimeout: 60000,  // Aumentare se troppo basso
  pingInterval: 25000, // Aumentare se troppo basso
  transports: ['websocket', 'polling'], // Fallback a polling
});
```

---

## 📊 STATUS ATTUALE

### Deploy Backend
- **Status**: ⏳ In corso su Render
- **Commit**: `5dbe346` - "fix: Standardize protected routes to use /sessions/"
- **ETA**: 2-5 minuti dal push (pushed ~20:06 UTC)

### Mark-Read Endpoint
- **Status**: ❌ 404 (normale, deploy non completo)
- **Fix**: ✅ Già pushato, in attesa deploy
- **Test After Deploy**:
  ```bash
  curl -X POST https://chatbot-lucy-2025.onrender.com/api/chat/sessions/{sessionId}/mark-read \
    -H "Authorization: Bearer {token}"
  # Expected: 200 OK
  ```

### Typing Indicator
- **Backend**: ✅ Implementato correttamente
- **Dashboard**: ✅ Implementato correttamente
- **Widget**: ✅ Implementato correttamente
- **Issue**: 🔍 Da debuggare - possibile problema sessionId mismatch o room join

### User Resume Notification
- **Status**: ❌ Non implementato
- **Impact**: 🟡 MEDIUM - Operatore non sa quando utente riprende chat
- **Fix**: ✅ Proposto sopra (getSession emit user_resumed_chat)

---

## 🎯 PROSSIMI PASSI

1. **Attendere Deploy Backend** (~2-5 min)
   - Verificare mark-read endpoint funziona
   - Controllare logs Render per errori

2. **Debug Typing Indicator**
   - Aggiungere logging nel widget (come sopra)
   - Testare con chat reale operatore-utente
   - Verificare sessionId matching

3. **Implementare User Resume Notification**
   - Modificare getSession backend
   - Aggiungere listener dashboard
   - Testare notification flow

4. **Investigare WebSocket Disconnections**
   - Controllare Render logs
   - Verificare socket.io configuration
   - Testare stabilità connessione

---

## 📝 TESTING CHECKLIST

### Typing Indicator Test
- [ ] Operatore apre chat nella dashboard
- [ ] Operatore inizia a scrivere messaggio
- [ ] Verificare backend log: `⌨️  Operator typing in session {id}: true`
- [ ] Verificare widget riceve evento: `console.log` operator_typing
- [ ] Verificare widget mostra "Admin sta scrivendo..."
- [ ] Operatore smette di scrivere (1 sec timeout)
- [ ] Verificare widget rimuove indicatore typing

### User Resume Test
- [ ] User apre chat, richiede operatore, operatore si unisce
- [ ] User chiude widget (X button)
- [ ] User riapre widget (localStorage ha sessionId)
- [ ] Widget chiama GET /session/:sessionId
- [ ] ❌ Operatore NON riceve notifica (problema confermato)
- [ ] ✅ DOPO FIX: Operatore riceve user_resumed_chat event
- [ ] ✅ DOPO FIX: Dashboard mostra badge/notifica

### WebSocket Stability Test
- [ ] Aprire widget
- [ ] Monitorare console per 5 minuti
- [ ] Contare numero disconnessioni/riconnessioni
- [ ] Verificare se pattern (es. ogni 30 sec = ping/pong issue)
- [ ] Controllare Render logs lato backend

---

**Fine Analisi**
