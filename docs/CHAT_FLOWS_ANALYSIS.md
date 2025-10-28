# Chat Flows & Actions - Analisi Completa

**Data**: 27 Ottobre 2025
**Analisi**: Flussi completi messaggi, azioni, notifiche e bugs
**Status**: 🔴 CRITICI ERRORI IDENTIFICATI

---

## 📋 Indice

1. [Panoramica Sistema](#panoramica-sistema)
2. [Flussi Completi - Scenari](#flussi-completi---scenari)
3. [Messaggi e Azioni](#messaggi-e-azioni)
4. [Bugs Critici Identificati](#bugs-critici-identificati)
5. [Notifiche e Badges](#notifiche-e-badges)
6. [Fix Raccomandati](#fix-raccomandati)

---

## Panoramica Sistema

### Componenti Principali

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   WIDGET    │◄────────┤   BACKEND    │◄────────┤  DASHBOARD   │
│  (Utente)   │ Socket  │ Express+     │ Socket  │ (Operatore)  │
│             │         │ Socket.IO    │         │              │
└─────────────┘         └──────────────┘         └──────────────┘
      │                        │                        │
      │ POST /session          │                        │
      │ POST /message          │ emit('new_chat')       │
      │ POST /request-operator │                        │
      │ POST /tickets          │ emit('new_ticket')     │
      └────────────────────────┴────────────────────────┘
```

### Stati Chat Session

| Stato | Descrizione | Quando | Operatore Assigned |
|-------|-------------|--------|--------------------|
| `ACTIVE` | Chat attiva con AI | Appena creata | ❌ No |
| `WITH_OPERATOR` | Chat con operatore umano | Dopo request_operator riuscita | ✅ Yes |
| `CLOSED` | Chat chiusa | Operatore chiude chat | Può essere Yes/No |
| `TICKET_CREATED` | Convertita in ticket | Quando crea ticket | N/A |

---

## Flussi Completi - Scenari

### SCENARIO 1: User chiede esplicitamente operatore - Operatore DISPONIBILE

**Trigger**: User scrive "Voglio parlare con una persona", AI rileva richiesta

#### 1.1 AI Response
```
File: backend/src/services/openai.service.js:165
Code: const operatorMentioned = /metto in contatto|parla con un operatore|.../.test(aiMessage);
```

**Cosa succede**:
- AI risponde: "Ti metto in contatto con un operatore!"
- `suggestOperator: true`

#### 1.2 Widget mostra Smart Actions
```
File: snippets/chatbot-popup.liquid:1027-1043
```

**Smart Actions mostrate**:
```javascript
[
  {
    icon: '👤',
    text: 'Parla con un operatore',
    action: 'request_operator',
    type: 'primary'
  },
  {
    icon: '🤖',
    text: 'Continua con AI',
    action: 'continue_ai',
    type: 'secondary'
  }
]
```

**UX**:
- ✅ Messaggio AI: "Ti metto in contatto..."
- ✅ Button "Parla con un operatore" (RED)
- ✅ Button "Continua con AI" (GRAY)

#### 1.3 User clicca "Parla con un operatore"

**Widget invia**:
```javascript
POST /api/chat/session/{sessionId}/request-operator
```

**Backend** (`chat.controller.js:169-258`):
```javascript
// Check operatori disponibili
const availableOperators = await prisma.operator.findMany({
  where: {
    isOnline: true,      // ✅ Connesso a dashboard
    isAvailable: true,   // ✅ Disponibile a ricevere chat
  },
  orderBy: { totalChatsHandled: 'asc' }, // Meno occupato
});
```

**✅ Operatori trovati** (availableOperators.length > 0):

```javascript
// Assegna operatore
const assignedOperator = availableOperators[0];

// Update session
await prisma.chatSession.update({
  where: { id: sessionId },
  data: {
    status: 'WITH_OPERATOR',           // ✅ Status cambiato
    operatorId: assignedOperator.id,
  },
});

// Aggiungi messaggio sistema
messages.push({
  type: 'system',
  content: `${assignedOperator.name} si è unito alla chat`,  // ✅
});

// Notifica operatore via Socket.IO
io.to(`operator:${assignedOperator.id}`).emit('new_chat_request', {
  sessionId: sessionId,
  userName: session.userName,
  lastMessage: messages[messages.length - 2]?.content || '',
});

// Notifica dashboard
io.to('dashboard').emit('chat_assigned', {
  sessionId: sessionId,
  operatorId: assignedOperator.id,
});

// Response a widget
res.json({
  operatorAvailable: true,
  operator: {
    id: assignedOperator.id,
    name: assignedOperator.name,
  },
});
```

#### 1.4 Widget riceve risposta

```javascript
// File: chatbot-popup.liquid:995-999
if (operatorData.data?.assigned) {
  isOperatorMode = true;
  updateHeaderForOperatorMode();
  addMessage('✅ Un operatore ti risponderà a breve!', 'system');
}
```

**UX Widget**:
- ✅ Header diventa: "🟢 CHAT DAL VIVO - OPERATORE"
- ✅ Messaggio sistema: "✅ Un operatore ti risponderà a breve!"
- ✅ Smart actions rimossi

#### 1.5 Socket.IO - Widget riceve evento

```javascript
// File: chatbot-popup.liquid:1459-1464
socket.on('operator_assigned', (data) => {
  isOperatorMode = true;
  updateHeaderForOperatorMode();
  addMessage(`✅ ${data.operatorName || 'Un operatore'} si è connesso alla chat!`, 'system');
});
```

**UX Widget**:
- ✅ Messaggio: "{Operatore Name} si è unito alla chat"

#### 1.6 Dashboard - Operatore riceve notifica

**Socket event**:
```javascript
socket.on('new_chat_request', {
  sessionId: '...',
  userName: 'Guest',
  lastMessage: '...'
});
```

**❌ PROBLEMA**: Dashboard ChatWindow.tsx NON ascolta questo evento!
**❌ MANCA**: Notifica browser, badge, suono

---

### SCENARIO 2: User chiede operatore - NESSUN operatore disponibile

**Trigger**: Same as Scenario 1, ma `availableOperators.length === 0`

#### 2.1 Backend ritorna

```javascript
// File: chat.controller.js:192-200
if (availableOperators.length === 0) {
  return res.json({
    success: true,
    data: {
      operatorAvailable: false,
      message: 'Nessun operatore disponibile. Vuoi aprire un ticket?',
    },
  });
}
```

#### 2.2 Widget riceve risposta

```javascript
// File: chatbot-popup.liquid:992-994
if (operatorData.data?.operatorAvailable === false) {
  addMessage(operatorData.data.message || 'Nessun operatore disponibile al momento.', 'bot');
}
```

**UX Widget ATTUALE**:
- ✅ Messaggio bot: "Nessun operatore disponibile. Vuoi aprire un ticket?"
- ❌ **NESSUNA AZIONE DISPONIBILE** - Solo testo!

**❌ PROBLEMA CRITICO**:
- Messaggio chiede "Vuoi aprire un ticket?"
- MA non c'è button/action per farlo!
- User rimane bloccato senza opzioni

**✅ DOVREBBE mostrare Smart Actions**:
```javascript
[
  {
    icon: '📝',
    text: 'Apri Ticket',
    action: 'request_ticket',
    type: 'primary'
  },
  {
    icon: '🤖',
    text: 'Continua con AI',
    action: 'continue_ai',
    type: 'secondary'
  }
]
```

---

### SCENARIO 3: AI suggerisce operatore (bassa confidence) - Nessun operatore disponibile

**Trigger**: AI risponde con `confidence < 0.7` O menziona operatore

#### 3.1 AI Response con bassa confidence

```javascript
// File: openai.service.js:162-172
return {
  message: aiMessage,
  confidence: 0.5,  // Bassa confidence
  suggestOperator: confidence < 0.7 || operatorMentioned,  // ✅ true
};
```

#### 3.2 Widget mostra Smart Actions

```javascript
// File: chatbot-popup.liquid:1027-1043
if (data.data.aiResponse.suggestOperator) {
  showSmartActions([
    {
      icon: '👤',
      text: 'Parla con un operatore',
      action: 'request_operator',
      type: 'primary'
    },
    {
      icon: '🤖',
      text: 'Continua con AI',
      action: 'continue_ai',
      type: 'secondary'
    }
  ]);
}
```

#### 3.3 User clicca "Parla con un operatore"

→ **Stesso flusso Scenario 2**

**❌ PROBLEMA**: User clicca button, non ci sono operatori, messaggio senza azione!

---

### SCENARIO 4: Chat con operatore - Scambio messaggi

#### 4.1 User invia messaggio

```javascript
// Widget: chatbot-popup.liquid:1006-1020
POST /api/chat/session/{sessionId}/message
body: { message: "Ciao, ho bisogno di aiuto" }
```

**Backend** (`chat.controller.js:76-163`):
```javascript
// Se status = WITH_OPERATOR
if (session.status === 'WITH_OPERATOR' && session.operatorId) {
  // Forward a operatore via WebSocket
  io.to(`operator:${session.operatorId}`).emit('user_message', {
    sessionId: sessionId,
    userName: session.userName,
    message: userMessage,
  });

  // NO AI response
  return res.json({
    success: true,
    data: { message: userMessage, aiResponse: null },
  });
}
```

**UX Widget**:
- ✅ Messaggio user aggiunto
- ✅ NO risposta AI
- ⏳ Attende risposta operatore

#### 4.2 Operatore risponde da Dashboard

**Dashboard**: ChatWindow.tsx invia messaggio tramite API

**Socket evento a widget**:
```javascript
// File: chatbot-popup.liquid:1449-1457
socket.on('operator_message', (data) => {
  if (data.message && !displayedMessageIds.has(data.message.id)) {
    displayedMessageIds.add(data.message.id);
    addMessage(data.message.content, 'operator', data.message.operatorName);
  }
});
```

**UX Widget**:
- ✅ Messaggio operatore appare
- ✅ Nome operatore mostrato
- ✅ Bubble colore verde con bordo

---

### SCENARIO 5: Ticket Creation - da widget

#### 5.1 Quando dovrebbe attivarsi

**ATTUALE** (❌ BROKEN):
- Messaggio "Vuoi aprire un ticket?" → solo testo

**DOVREBBE**:
- Smart action "Apri Ticket" → mostra form

#### 5.2 Form Ticket

**Codice esiste**: `chatbot-popup.liquid:1333-1350`
```javascript
function showTicketForm() {
  // HTML form con nome, email, messaggio
  // Button "📨 Invia messaggio"
}
```

**❌ PROBLEMA**: Funzione `showTicketForm()` mai chiamata!

#### 5.3 Submit Ticket

**Codice**: `chatbot-popup.liquid:1353-1394`
```javascript
POST /api/tickets
body: {
  sessionId: sessionId,
  userName: name,
  contactMethod: 'EMAIL',
  email: email,
  initialMessage: message,
  priority: 'NORMAL'
}
```

**Backend** (`ticket.controller.js:11-107`):
- Crea ticket
- Update session status → `TICKET_CREATED`
- Genera resume token
- Invia email/WhatsApp
- Notifica dashboard: `emit('new_ticket_created')`

**UX Widget**:
- ✅ Messaggio: "✅ Ticket creato! Ti ricontatteremo..."
- ✅ Form rimosso

---

### SCENARIO 6: Operatore chiude chat

#### 6.1 Dashboard - Operatore clicca "Chiudi Chat"

**ChatWindow.tsx:192-206**:
```javascript
POST /api/chat/session/{sessionId}/close
```

**Backend** (`chat.controller.js:264-330`):
```javascript
// Aggiungi messaggio chiusura
messages.push({
  type: 'system',
  content: 'La chat è stata chiusa dall\'operatore. Grazie per averci contattato!',
});

// Update session
await prisma.chatSession.update({
  where: { id: sessionId },
  data: {
    status: 'CLOSED',
    closedAt: new Date(),
    messages: JSON.stringify(messages),
  },
});

// Notifica widget
io.to(`chat:${sessionId}`).emit('chat_closed', {
  sessionId: sessionId,
  message: closingMessage,
});

io.to(`chat:${sessionId}`).emit('new_message', closingMessage);
```

#### 6.2 Widget riceve evento

```javascript
// chatbot-popup.liquid:1472-1476
socket.on('chat_closed', (data) => {
  addMessage('La chat è stata chiusa. Grazie per averci contattato!', 'system');
  isOperatorMode = false;
});
```

**UX Widget**:
- ✅ Messaggio sistema: "La chat è stata chiusa..."
- ✅ Header torna normale
- ⚠️ Input NON disabilitata (possibile bug)

---

## Messaggi e Azioni

### Messaggi System nel Widget

| Messaggio | Quando | Tipo | Source |
|-----------|--------|------|--------|
| "Ciao! Sono Lucy..." | Initial load | bot | Hardcoded widget |
| "{Name} si è unito alla chat" | Operatore assegnato | system | Backend |
| "✅ Un operatore ti risponderà..." | Request operator riuscita | system | Widget |
| "Sei in coda..." | In attesa operatore | system | Widget |
| "La chat è stata chiusa..." | Chat chiusa | system | Backend |
| "Nessun operatore disponibile..." | No operatori | bot | Backend |

### Smart Actions Possibili

| Action | Icon | Text | Quando | Type |
|--------|------|------|--------|------|
| `request_operator` | 👤 | Parla con un operatore | AI suggests | primary |
| `continue_ai` | 🤖 | Continua con AI | AI suggests | secondary |
| `request_ticket` | 📝 | Apri Ticket | ❌ MAI (dovrebbe essere quando no operatori) | primary |
| `continue_chat` | 💬 | Continua chat | Non implementato | info |
| `end_chat` | 👋 | Termina chat | Non implementato | secondary |

### Messaggi Dashboard (Operatore)

| Evento Socket | Quando | UI Update |
|---------------|--------|-----------|
| `new_chat_request` | Chat assegnata | ❌ NESSUNA notifica implementata |
| `user_message` | User invia msg | ❓ Non verificato |
| `chat_closed` | Chat chiusa | ❓ Non verificato |
| `chat_transferred_to_you` | Chat trasferita a te | ❓ Non verificato |

---

## Bugs Critici Identificati

### 🔴 BUG #1: Nessun operatore disponibile - Nessuna azione ticket

**File**: `snippets/chatbot-popup.liquid:992-995`

**Problema**:
```javascript
if (operatorData.data?.operatorAvailable === false) {
  // SOLO messaggio, NESSUNA action
  addMessage(operatorData.data.message || 'Nessun operatore disponibile al momento.', 'bot');
  // ❌ Dovrebbe mostrare showSmartActions([...ticket actions...])
}
```

**Impact**: 🔴 CRITICO
**User Experience**: User bloccato senza opzione ticket

**Fix**:
```javascript
if (operatorData.data?.operatorAvailable === false) {
  addMessage(operatorData.data.message || 'Nessun operatore disponibile al momento.', 'bot');

  // ✅ AGGIUNGI SMART ACTIONS
  showSmartActions([
    {
      icon: '📝',
      text: 'Apri Ticket',
      description: 'Lascia un messaggio, ti ricontatteremo',
      action: 'request_ticket',
      type: 'primary'
    },
    {
      icon: '🤖',
      text: 'Continua con AI',
      description: 'Prova a chiedermi altro',
      action: 'continue_ai',
      type: 'secondary'
    }
  ]);
}
```

---

### 🔴 BUG #2: Action `request_ticket` non implementata

**File**: `snippets/chatbot-popup.liquid:1196-1211`

**Problema**:
```javascript
actionButton.addEventListener('click', () => {
  if (action.action === 'request_operator') {
    sendMessage('request_operator');
  } else if (action.action === 'continue_ai') {
    sendMessage('continua con assistente AI');
  } else if (action.action === 'request_ticket') {
    sendMessage('apri ticket');  // ❌ Chiama sendMessage ma dovrebbe mostrare form!
  }
});
```

**Impact**: 🔴 CRITICO
**Attuale comportamento**: Invia "apri ticket" come messaggio utente (❌ SBAGLIATO)

**Fix**:
```javascript
} else if (action.action === 'request_ticket') {
  showTicketForm();  // ✅ Mostra form ticket
  actionsContainer.remove();
}
```

---

### 🟠 BUG #3: Dashboard - Nessuna notifica nuova chat

**File**: Dashboard non ascolta socket `new_chat_request`

**Problema**:
- Backend emette: `io.to('operator:${operatorId}').emit('new_chat_request', ...)`
- Dashboard ChatWindow.tsx: ❌ NESSUN listener per questo evento

**Impact**: 🟠 ALTO
**User Experience**: Operatore non sa che ha chat assegnata

**Fix richiesto**:
1. Aggiungere socket listener in Dashboard
2. Mostrare notification browser
3. Badge con numero chat pending
4. Opzionale: suono notifica

**Esempio**:
```typescript
// Dashboard component
socket.on('new_chat_request', (data) => {
  // Show browser notification
  if (Notification.permission === 'granted') {
    new Notification('Nuova Chat Assegnata', {
      body: `${data.userName}: ${data.lastMessage}`,
      icon: '/logo.png'
    });
  }

  // Play sound
  new Audio('/notification.mp3').play();

  // Update badge
  setChatBadgeCount(prev => prev + 1);

  // Refresh chat list
  refreshChats();
});
```

---

### 🟡 BUG #4: Input widget non disabilitata dopo chat chiusa

**File**: `snippets/chatbot-popup.liquid:1472-1476`

**Problema**:
```javascript
socket.on('chat_closed', (data) => {
  addMessage('La chat è stata chiusa. Grazie per averci contattato!', 'system');
  isOperatorMode = false;
  // ❌ MANCA: disabilitare input
});
```

**Impact**: 🟡 MEDIO
**User Experience**: User può ancora scrivere ma messaggi non vanno da nessuna parte

**Fix**:
```javascript
socket.on('chat_closed', (data) => {
  addMessage('La chat è stata chiusa. Grazie per averci contattato!', 'system');
  isOperatorMode = false;

  // ✅ Disabilita input
  setInputState(false);
  input.placeholder = 'Chat chiusa';

  // Opzionale: mostra button "Nuova Chat"
  showSmartActions([{
    icon: '💬',
    text: 'Inizia nuova chat',
    action: 'new_chat',
    type: 'primary'
  }]);
});
```

---

### 🟡 BUG #5: showTicketForm() mai chiamata

**File**: `snippets/chatbot-popup.liquid:1333-1350`

**Problema**: Funzione esiste ma MAI chiamata da nessuna parte

**Impact**: 🟡 MEDIO
**Consequence**: Ticket form non accessibile dal widget

**Fix**: Chiamare da action `request_ticket` (vedi Bug #2)

---

## Notifiche e Badges

### Widget (Utente)

| Notifica | Quando | Status |
|----------|--------|--------|
| Badge rosso con "1" | 3 sec dopo load | ✅ Funziona |
| Messaggio operatore assegnato | Request operator success | ✅ Funziona |
| Messaggio chat chiusa | Operatore chiude | ✅ Funziona |
| Header cambia a "CHAT DAL VIVO" | Operatore assegnato | ✅ Funziona |

### Dashboard (Operatore)

| Notifica | Quando | Status |
|----------|--------|--------|
| Browser notification | Nuova chat assegnata | ❌ NON IMPLEMENTATO |
| Badge numero chat pending | Chat in attesa | ❌ NON IMPLEMENTATO |
| Suono notifica | Nuova chat | ❌ NON IMPLEMENTATO |
| Badge su sidebar "Chat" | Chat non lette | ❌ NON IMPLEMENTATO |
| Desktop notification | Nuovo messaggio | ❌ NON IMPLEMENTATO |

---

## Fix Raccomandati

### Priority P0 (CRITICI - Blocca UX)

#### P0.1 - Fix request_ticket action

**File**: `snippets/chatbot-popup.liquid:1207`

**Fix**:
```javascript
} else if (action.action === 'request_ticket') {
  showTicketForm();  // Mostra form invece di inviare messaggio
  actionsContainer.remove();
}
```

**Effort**: 5 minuti
**Impact**: Sblocca creazione ticket

---

#### P0.2 - Mostra smart actions quando no operatori

**File**: `snippets/chatbot-popup.liquid:992-995`

**Fix**:
```javascript
if (operatorData.data?.operatorAvailable === false) {
  addMessage(operatorData.data.message || 'Nessun operatore disponibile al momento.', 'bot');

  showSmartActions([
    {
      icon: '📝',
      text: 'Apri Ticket',
      description: 'Lascia un messaggio, ti ricontatteremo',
      action: 'request_ticket',
      type: 'primary'
    },
    {
      icon: '🤖',
      text: 'Continua con AI',
      description: 'Prova a chiedermi altro',
      action: 'continue_ai',
      type: 'secondary'
    }
  ]);
}
```

**Effort**: 10 minuti
**Impact**: User non bloccato, può aprire ticket

---

### Priority P1 (ALTA - Migliora UX)

#### P1.1 - Dashboard notifications

**Files**: Vari file Dashboard

**Fix richiesto**:
1. Aggiungere socket listener `new_chat_request`
2. Implementare browser notifications
3. Badge count chat pending
4. Suono notifica

**Effort**: 2-3 ore
**Impact**: Operatori ricevono notifiche chat

---

#### P1.2 - Disabilita input dopo chat chiusa

**File**: `snippets/chatbot-popup.liquid:1472-1476`

**Fix**: Vedi Bug #4

**Effort**: 10 minuti
**Impact**: UX più chiara

---

### Priority P2 (MEDIA - Nice to have)

#### P2.1 - Badge chat non lette dashboard

**Impact**: Operatore vede quante chat ha pending

#### P2.2 - Typing indicator quando operatore scrive

**Impact**: User sa che operatore sta rispondendo

#### P2.3 - Sound notification widget

**Impact**: User sente quando operatore risponde

---

## Testing Checklist

Dopo aver applicato i fix, testare:

### Test 1: Request Operator - Nessuno disponibile
- [ ] Impostare tutti operatori `isAvailable = false`
- [ ] Widget: chiedere operatore
- [ ] ✅ Dovrebbe mostrare messaggio + smart actions (Ticket + Continua AI)
- [ ] Click "Apri Ticket"
- [ ] ✅ Dovrebbe mostrare form ticket
- [ ] Compilare e inviare
- [ ] ✅ Dovrebbe creare ticket e mostrare conferma

### Test 2: Request Operator - Disponibile
- [ ] Impostare almeno un operatore `isOnline = true` e `isAvailable = true`
- [ ] Widget: chiedere operatore
- [ ] ✅ Dovrebbe assegnare operatore
- [ ] ✅ Dashboard dovrebbe ricevere notifica (dopo fix P1.1)
- [ ] ✅ Widget header cambia a "CHAT DAL VIVO"
- [ ] Operatore risponde
- [ ] ✅ Widget riceve messaggio operatore

### Test 3: AI bassa confidence
- [ ] Widget: fare domanda vaga ("Ho un problema")
- [ ] ✅ AI risponde con `suggestOperator: true`
- [ ] ✅ Smart actions appaiono
- [ ] Click "Continua con AI"
- [ ] ✅ Actions rimossi, chat continua normale

### Test 4: Chat chiusa da operatore
- [ ] Dashboard: chiudere chat attiva
- [ ] ✅ Widget riceve messaggio "Chat chiusa"
- [ ] ✅ Input disabilitata (dopo fix P1.2)
- [ ] ✅ Opzionale: button "Nuova Chat" appare

---

**Creato**: 27 Ottobre 2025
**Autore**: Chat Flows Analysis
**Status**: 🔴 CRITICI FIX NECESSARI

**Next Steps**:
1. Applicare fix P0.1 e P0.2 (30 min)
2. Testare flusso ticket
3. Applicare fix P1.1 (dashboard notifications)
4. Testing completo end-to-end
