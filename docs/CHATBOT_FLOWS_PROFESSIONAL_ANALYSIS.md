# 🎯 Analisi Professionale Flussi Chatbot - Standard di Mercato

**Data**: 30 Ottobre 2025, 21:30
**Scopo**: Analisi completa di tutti i flussi utente-widget-operatore-ticket secondo best practices professionali

---

## 📚 PREMESSA: Standard di Mercato Chatbot Professionali

### Principi Fondamentali (Intercom, Zendesk, Drift, LiveChat)

1. **Trasparenza Totale**: User sempre informato su cosa sta succedendo
2. **Feedback Continuo**: Ogni azione ha una risposta visibile immediata
3. **Stati Chiari**: User sa sempre in che stato è la conversazione
4. **Controllo User**: User può sempre annullare/interrompere
5. **Graceful Degradation**: Se qualcosa fallisce, c'è sempre un piano B
6. **Persistenza Intelligente**: Session management che ha senso per l'utente

---

## 🔍 ANALISI CODICE ESISTENTE

### Backend - Eventi WebSocket Emessi

```javascript
// Emessi dal backend:
io.to('dashboard').emit('new_chat_created', {...})           // Nuova sessione creata
io.to(`operator_${id}`).emit('new_chat_request', {...})     // ❌ PROBLEMA: Auto-assigned
io.to('dashboard').emit('chat_assigned', {...})             // Chat assegnata
io.to(`chat_${sessionId}`).emit('operator_assigned', {...}) // Operatore assegnato al widget
io.to(`operator_${id}`).emit('user_message', {...})         // Messaggio da user
io.to(`chat_${sessionId}`).emit('operator_message', {...})  // Messaggio da operator
io.to(`chat:${sessionId}`).emit('chat_closed', {...})       // ❌ BUG: Typo chat: vs chat_
```

### Backend - Flow Request Operator (ATTUALE - ROTTO)

```javascript
// File: backend/src/controllers/chat.controller.js:237-332
// POST /api/chat/session/:sessionId/request-operator

1. User clicca "Parla con operatore"
2. Backend:
   ❌ Trova IMMEDIATAMENTE operatore disponibile
   ❌ Assegna SUBITO (status = WITH_OPERATOR)
   ❌ Aggiunge messaggio "Mario si è unito alla chat"
   ❌ Emette 'new_chat_request' all'operatore

PROBLEMA: Operatore NON ha possibilità di accettare/rifiutare!
PROBLEMA: User non ha feedback "In attesa..."
PROBLEMA: Se operatore non risponde, user bloccato
```

---

## 🎯 FLUSSI CORRETTI - Standard Professionale

### FLUSSO 1: User Richiede Operatore (NUOVO)

```
┌─────────────────────────────────────────────────────────────┐
│  STATO: ACTIVE → WAITING_OPERATOR → WITH_OPERATOR          │
└─────────────────────────────────────────────────────────────┘

Step 1: User Clicca "Parla con operatore"
  └─> Widget:
      ├─ POST /api/chat/session/:id/request-operator
      ├─ Disabilita input temporaneamente
      └─ Mostra: "🔄 Cerco un operatore disponibile..."

Step 2: Backend Verifica Disponibilità
  └─> Se operatori disponibili:
      ├─ Cambia status → WAITING_OPERATOR ✅
      ├─ NON assegna ancora operatore ✅
      ├─ Salva timestamp requestedAt
      ├─ Emette a TUTTI operatori disponibili:
      │   io.to('dashboard').emit('operator_request_pending', {
      │     sessionId, userName, lastMessage, priority, waitingSince
      │   })
      └─> Response al widget:
          { operatorAvailable: true, status: 'WAITING_OPERATOR' }

  └─> Se NO operatori disponibili:
      ├─ Response: { operatorAvailable: false }
      └─> Widget mostra:
          "❌ Nessun operatore disponibile.
           Vuoi aprire un ticket? Ti ricontatteremo."
          [Apri Ticket] [Continua con AI]

Step 3: Widget Riceve Conferma
  └─> Se operatorAvailable: true
      ├─ Mostra: "⏳ In attesa di un operatore..."
      ├─ Mostra animated dots: "• • •"
      ├─ Mostra timer: "In coda da: 0:15"
      ├─ Mostra pulsante: [Annulla Richiesta]
      ├─ Input DISABILITATO (non può scrivere mentre aspetta)
      └─ Start polling/waiting per operator_joined event

Step 4: Operatore Vede Richiesta in Dashboard
  └─> Dashboard:
      ├─ 🔔 Notifica browser: "Nuova richiesta da {userName}"
      ├─ 🔊 Suono notifica
      ├─ Chat appare in lista con badge "WAITING"
      ├─ Mostra: "⏳ In attesa di accettazione"
      ├─ Pulsante ACCETTA ben visibile e verde
      └─ Mostra preview ultimo messaggio

Step 5A: Operatore Accetta
  └─> Operatore clicca [Accetta Chat]
      ├─ POST /api/chat/sessions/:id/accept-operator
      ├─ Body: { operatorId }
      └─> Backend:
          ├─ Verifica session.status === 'WAITING_OPERATOR'
          ├─ Verifica operator.isAvailable === true
          ├─ Assegna: session.operatorId = operatorId
          ├─ Cambia: session.status = 'WITH_OPERATOR' ✅
          ├─ Salva: session.operatorJoinedAt = now()
          ├─ Aggiunge system message:
          │   "{operatorName} si è unito alla chat"
          │
          ├─ Emette al widget:
          │   io.to(`chat_${sessionId}`).emit('operator_joined', {
          │     operatorId, operatorName, joinedAt
          │   })
          │
          ├─ Emette alla dashboard:
          │   io.to('dashboard').emit('chat_accepted', {
          │     sessionId, operatorId
          │   })
          │
          └─> Widget riceve 'operator_joined':
              ├─ Mostra: "✅ {operatorName} si è unito alla chat"
              ├─ Input RIABILITATO
              ├─ Placeholder: "Scrivi un messaggio..."
              ├─ Rimuove timer
              └─ User può iniziare a scrivere

Step 5B: Operatore NON Accetta (Timeout)
  └─> Dopo 2 minuti senza accettazione:
      ├─ Backend background job verifica:
      │   WHERE status = 'WAITING_OPERATOR'
      │   AND requestedAt < now() - 2 minutes
      │
      └─> Backend:
          ├─ Cerca ALTRO operatore disponibile
          ├─ Se trovato: Re-emit 'operator_request_pending'
          ├─ Se NO: Proponi ticket al user
          │
          └─> Emette al widget:
              io.to(`chat_${sessionId}`).emit('operator_timeout', {
                message: "Nessun operatore ha risposto",
                suggestTicket: true
              })

          └─> Widget mostra:
              "⏱️ Nessun operatore disponibile al momento.
               Vuoi aprire un ticket? Ti ricontatteremo appena possibile."
              [Apri Ticket] [Continua con AI]

Step 5C: User Annulla Richiesta
  └─> User clicca [Annulla Richiesta]
      ├─ POST /api/chat/sessions/:id/cancel-operator-request
      └─> Backend:
          ├─ Verifica status === 'WAITING_OPERATOR'
          ├─ Cambia status → 'ACTIVE'
          ├─ Rimuove timestamp requestedAt
          ├─ Aggiunge system message:
          │   "Richiesta operatore annullata"
          │
          └─> Response: { success: true, status: 'ACTIVE' }

          └─> Widget:
              ├─ Mostra: "Richiesta annullata. Puoi continuare con l'AI."
              ├─ Input RIABILITATO
              └─> Torna a conversazione AI
```

---

### FLUSSO 2: Conversazione Operatore ↔ User

```
┌─────────────────────────────────────────────────────────────┐
│  STATO: WITH_OPERATOR (conversazione attiva)                │
└─────────────────────────────────────────────────────────────┘

User Invia Messaggio:
  └─> Widget:
      ├─ POST /api/chat/session/:id/message
      ├─ Body: { message: "testo", type: "user" }
      ├─ Optimistic UI: Mostra messaggio immediatamente
      ├─ Emette: socket.emit('user_typing', { isTyping: false })
      └─> Backend:
          ├─ Salva messaggio in DB
          ├─ Increment unreadMessageCount se operator non in chat
          ├─ Emette: io.to(`operator_${operatorId}`).emit('user_message', {
          │     sessionId, message, unreadCount
          │   })
          └─> Dashboard riceve:
              ├─ Chat va in cima lista
              ├─ Badge rosso con unreadCount
              ├─ Se chat non aperta: notifica browser + suono
              └─ Se chat aperta: messaggio appare automaticamente

Operatore Invia Messaggio:
  └─> Dashboard:
      ├─ Operatore scrive in ChatWindow
      ├─ POST /api/chat/sessions/:id/operator-message
      ├─ Body: { message: "testo", operatorId }
      └─> Backend:
          ├─ Salva messaggio in DB
          ├─ Emette: io.to(`chat_${sessionId}`).emit('operator_message', {
          │     sessionId, message: { id, type: 'operator', content, operatorName, timestamp }
          │   })
          ├─ Emette echo a dashboard:
          │   io.to(`operator_${operatorId}`).emit('operator_message', {
          │     sessionId, message
          │   })
          └─> Widget riceve:
              ├─ Mostra messaggio nella chat
              ├─ Se widget chiuso: badge + notifica + suono
              ├─ Scroll automatico a ultimo messaggio
              └─ User può rispondere

Typing Indicator:
  └─> Operatore digita:
      ├─ socket.emit('operator_typing', { sessionId, operatorName, isTyping: true })
      ├─ Backend: socket.to(`chat_${sessionId}`).emit('operator_typing', {...})
      └─> Widget: Mostra "{operatorName} sta scrivendo..."

  └─> User digita:
      ├─ socket.emit('user_typing', { sessionId, isTyping: true })
      ├─ Backend: socket.to(`operator_${operatorId}`).emit('user_typing', {...})
      └─> Dashboard: Mostra "Sta scrivendo..." sotto nome chat
```

---

### FLUSSO 3: Operatore Chiude Chat

```
┌─────────────────────────────────────────────────────────────┐
│  STATO: WITH_OPERATOR → CLOSED                              │
└─────────────────────────────────────────────────────────────┘

Operatore Clicca "Close Chat Session":
  └─> Dashboard:
      ├─ Mostra conferma:
      │   "Vuoi chiudere definitivamente questa chat?
      │    L'utente non potrà più inviare messaggi."
      │   [Annulla] [Chiudi Chat]
      │
      └─> Se conferma:
          ├─ POST /api/chat/sessions/:id/close
          └─> Backend:
              ├─ Cambia status → 'CLOSED'
              ├─ Salva closedAt, closedBy
              ├─ Aggiunge system message:
              │   "Chat chiusa da {operatorName}"
              │
              ├─ Invia email transcript (se user ha email)
              │
              ├─ Emette al widget:
              │   io.to(`chat_${sessionId}`).emit('chat_closed', {
              │     sessionId,
              │     closedBy: operatorName,
              │     message: "La chat è stata chiusa. Grazie per averci contattato!"
              │   })
              │
              └─> Widget riceve 'chat_closed':
                  ├─ Mostra messaggio: "✅ Chat chiusa da {operatorName}"
                  ├─ Input DISABILITATO
                  ├─ Placeholder: "Chat chiusa"
                  ├─ Mostra pulsante: [Inizia Nuova Chat]
                  ├─ localStorage.removeItem('sessionId') ✅
                  └─> Click [Inizia Nuova Chat]:
                      ├─ POST /api/chat/session (crea nuova)
                      ├─ localStorage.setItem('sessionId', newId)
                      └─ Ricarica widget con nuova sessione
```

---

### FLUSSO 4: User Chiude e Riapre Widget

```
┌─────────────────────────────────────────────────────────────┐
│  STATO: Session Persistence & Resume                        │
└─────────────────────────────────────────────────────────────┘

User Chiude Widget (X button):
  └─> Widget:
      ├─ Collassa a icona
      ├─ sessionId RIMANE in localStorage ✅
      ├─ Socket disconnesso (ma riconnette al reopen)
      └─ Nessuna chiamata API

User Riapre Widget (stesso giorno):
  └─> Widget:
      ├─ Legge sessionId da localStorage
      ├─ GET /api/chat/session/:sessionId
      └─> Backend:
          ├─ Ritorna session con status, messages, operator
          │
          ├─ Se status === 'WITH_OPERATOR' E operatorId:
          │   └─> Emette notifica a operatore:
          │       io.to(`operator_${operatorId}`).emit('user_resumed_chat', {
          │         sessionId, userName, timestamp, lastSeenAt
          │       })
          │
          │       Dashboard riceve:
          │       ├─ Chat va in cima lista
          │       ├─ Badge "🟢 Online" appare
          │       ├─ Notifica: "{userName} è tornato nella chat"
          │       └─ Suono notifica
          │
          └─> Widget:
              ├─ Carica tutti i messaggi
              ├─ Scroll a ultimo messaggio
              ├─ Se status === 'WITH_OPERATOR':
              │   ├─ Mostra: "💬 In chat con {operatorName}"
              │   ├─ Input abilitato
              │   └─ User può continuare conversazione
              │
              └─ Se status === 'CLOSED':
                  ├─ Mostra: "Chat chiusa"
                  ├─ Input disabilitato
                  └─ Pulsante: [Inizia Nuova Chat]

User Riapre Widget (giorni dopo):
  └─> Widget:
      ├─ GET /api/chat/session/:sessionId
      └─> Backend:
          ├─ Verifica: createdAt < now() - 7 days
          ├─ Se troppo vecchia:
          │   └─> Auto-close session:
          │       ├─ status → 'CLOSED'
          │       ├─ closedBy: 'system'
          │       └─> Response: {
          │             success: true,
          │             sessionExpired: true,
          │             message: "Sessione scaduta"
          │           }
          │
          └─> Widget:
              ├─ Mostra: "⏱️ Questa chat è scaduta"
              ├─ Pulsante: [Inizia Nuova Chat]
              ├─ localStorage.removeItem('sessionId')
              └─> Click button → Crea nuova sessione
```

---

### FLUSSO 5: Escalation a Ticket

```
┌─────────────────────────────────────────────────────────────┐
│  STATO: ACTIVE/WITH_OPERATOR → TICKET_CREATED               │
└─────────────────────────────────────────────────────────────┘

Scenario A: User Crea Ticket (Nessun Operatore)
  └─> Widget mostra: "Nessun operatore disponibile. Vuoi aprire un ticket?"
      ├─ User clicca [Apri Ticket]
      └─> Widget:
          ├─ Mostra form:
          │   ┌──────────────────────────────────────┐
          │   │  Apri un Ticket                      │
          │   ├──────────────────────────────────────┤
          │   │  Come preferisci essere contattato?  │
          │   │  ⚪ WhatsApp  ⚪ Email                │
          │   │                                      │
          │   │  [Numero WhatsApp / Email]          │
          │   │  +39 _________________               │
          │   │                                      │
          │   │  Descrivi la tua richiesta:         │
          │   │  [____________________________]      │
          │   │  [____________________________]      │
          │   │                                      │
          │   │  [Annulla]  [Invia Ticket]          │
          │   └──────────────────────────────────────┘
          │
          └─> User compila e invia:
              ├─ POST /api/tickets
              ├─ Body: {
              │     sessionId,
              │     userName,
              │     contactMethod: 'WHATSAPP' | 'EMAIL',
              │     whatsappNumber / email,
              │     initialMessage: "trascrizione chat + richiesta"
              │   }
              │
              └─> Backend:
                  ├─ Crea ticket in DB
                  ├─ Cambia session.status → 'TICKET_CREATED'
                  ├─ Invia email notifica a operatori
                  ├─ (Opzionale) Invia WhatsApp conferma a user
                  │
                  ├─ Emette: io.to('dashboard').emit('ticket_created', {
                  │     ticketId, sessionId, userName, contactMethod
                  │   })
                  │
                  └─> Response: {
                        success: true,
                        ticket: { id, resumeUrl }
                      }

                  └─> Widget:
                      ├─ Mostra: "✅ Ticket creato con successo!
                      │           Ti contatteremo presto."
                      ├─ Mostra: "ID Ticket: #12345"
                      ├─ Pulsante: [Chiudi]
                      ├─ localStorage.removeItem('sessionId')
                      └─> User clicca [Chiudi]: Widget collassa

Scenario B: Operatore Converte Chat in Ticket
  └─> Dashboard:
      ├─ Operatore in chat WITH_OPERATOR
      ├─ Operatore clicca "Convert to Ticket"
      └─> Mostra modal:
          ┌──────────────────────────────────────┐
          │  Converti in Ticket                  │
          ├──────────────────────────────────────┤
          │  Metodo contatto:                    │
          │  ⚪ WhatsApp  ⚪ Email                │
          │                                      │
          │  Contatto:                           │
          │  [____________________________]      │
          │                                      │
          │  Note per il team:                   │
          │  [____________________________]      │
          │                                      │
          │  [Annulla]  [Crea Ticket]           │
          └──────────────────────────────────────┘

      └─> Operatore invia:
          ├─ POST /api/chat/sessions/:id/convert-to-ticket
          └─> Backend:
              ├─ Crea ticket con transcript completo chat
              ├─ Chiude session (status → 'CLOSED')
              ├─ Emette: io.to(`chat_${sessionId}`).emit('converted_to_ticket', {
              │     ticketId, message: "La tua richiesta è stata registrata"
              │   })
              │
              └─> Widget:
                  ├─ Mostra: "✅ La tua richiesta è stata registrata
                  │           come ticket #12345. Ti ricontatteremo."
                  ├─ Input disabilitato
                  └─ localStorage.removeItem('sessionId')
```

---

## 🎨 TESTI E NOTIFICHE - Best Practices

### Messaggi User (Widget)

```javascript
const WIDGET_MESSAGES = {
  // Stati
  WAITING_OPERATOR: "⏳ Cerco un operatore disponibile...",
  IN_QUEUE: "⏳ In attesa di un operatore... ({position} in coda)",
  OPERATOR_JOINED: "✅ {operatorName} si è unito alla chat",
  OPERATOR_LEFT: "👋 {operatorName} ha lasciato la chat",
  CHAT_CLOSED: "✅ Chat chiusa. Grazie per averci contattato!",
  SESSION_EXPIRED: "⏱️ Questa conversazione è scaduta",

  // Azioni
  NO_OPERATOR_AVAILABLE: "❌ Nessun operatore disponibile al momento.\nVuoi aprire un ticket? Ti ricontatteremo appena possibile.",
  TICKET_CREATED: "✅ Ticket #{ticketId} creato con successo!\nTi contatteremo presto.",
  REQUEST_CANCELLED: "Richiesta operatore annullata. Puoi continuare con l'AI.",

  // Errori
  CONNECTION_LOST: "⚠️ Connessione persa. Riconnessione in corso...",
  MESSAGE_SEND_FAILED: "❌ Invio fallito. Riprova.",
  SESSION_NOT_FOUND: "❌ Sessione non trovata. Inizia una nuova chat.",

  // Typing
  OPERATOR_TYPING: "{operatorName} sta scrivendo...",
  AI_TYPING: "L'assistente sta scrivendo...",

  // Input placeholders
  INPUT_PLACEHOLDER_ACTIVE: "Scrivi un messaggio...",
  INPUT_PLACEHOLDER_WAITING: "Attendi risposta operatore...",
  INPUT_PLACEHOLDER_CLOSED: "Chat chiusa",

  // Buttons
  BTN_REQUEST_OPERATOR: "💬 Parla con un operatore",
  BTN_CANCEL_REQUEST: "Annulla richiesta",
  BTN_OPEN_TICKET: "📝 Apri un ticket",
  BTN_CONTINUE_AI: "🤖 Continua con l'AI",
  BTN_NEW_CHAT: "✨ Inizia nuova chat",
  BTN_SEND: "Invia",
};
```

### Messaggi Operatore (Dashboard)

```javascript
const DASHBOARD_MESSAGES = {
  // Notifiche
  NEW_CHAT_REQUEST: "Nuova richiesta da {userName}",
  USER_RESUMED: "{userName} è tornato nella chat",
  USER_MESSAGE: "Nuovo messaggio da {userName}",
  CHAT_ASSIGNED: "Chat assegnata a te",
  CHAT_TRANSFERRED: "Chat trasferita da {fromOperator}",

  // Stati chat list
  STATUS_WAITING: "⏳ In attesa di accettazione",
  STATUS_ACTIVE: "💬 In conversazione",
  STATUS_USER_OFFLINE: "⚪ Utente offline",
  STATUS_USER_ONLINE: "🟢 Utente online",

  // Azioni
  ACCEPT_CHAT: "Accetta Chat",
  CLOSE_CHAT: "Chiudi Chat",
  TRANSFER_CHAT: "Trasferisci",
  CONVERT_TO_TICKET: "Converti in Ticket",

  // Conferme
  CONFIRM_CLOSE: "Vuoi chiudere definitivamente questa chat?\nL'utente non potrà più inviare messaggi.",
  CONFIRM_TRANSFER: "Vuoi trasferire questa chat a {operatorName}?",

  // Successi
  CHAT_CLOSED_SUCCESS: "Chat chiusa con successo",
  TICKET_CREATED_SUCCESS: "Ticket #{ticketId} creato",
  TRANSFER_SUCCESS: "Chat trasferita a {operatorName}",
};
```

---

## 🚨 PROBLEMI CRITICI ATTUALI vs STANDARD

### ❌ Problema 1: Auto-Assignment Operatore

**ATTUALE (SBAGLIATO)**:
```javascript
// Backend auto-assegna appena user richiede
requestOperator() {
  assignedOperator = findAvailable()[0];
  session.status = 'WITH_OPERATOR';  // ❌ Subito!
  session.operatorId = assignedOperator.id;  // ❌ Senza accettazione!
}
```

**CORRETTO (STANDARD)**:
```javascript
requestOperator() {
  session.status = 'WAITING_OPERATOR';  // ✅ In attesa
  io.to('dashboard').emit('operator_request_pending');  // ✅ Notifica
  // Operatore DEVE accettare prima di assegnazione
}

acceptOperatorRequest() {  // ✅ Nuovo endpoint
  session.status = 'WITH_OPERATOR';
  session.operatorId = operatorId;
}
```

---

### ❌ Problema 2: Nessun Feedback User in Attesa

**ATTUALE**: User non sa cosa sta succedendo
**CORRETTO**: User vede:
- "⏳ In attesa di un operatore..."
- Timer: "In coda da: 0:45"
- Animated dots
- Pulsante [Annulla Richiesta]

---

### ❌ Problema 3: User Può Scrivere Durante Attesa

**ATTUALE**: Input sempre abilitato
**CORRETTO**: Input disabilitato quando status = WAITING_OPERATOR

---

### ❌ Problema 4: System Message Solo in Dashboard

**ATTUALE**: "{operatorName} si è unito" solo in dashboard
**CORRETTO**: Message visibile ANCHE nel widget user

---

### ❌ Problema 5: Nessun Timeout Gestione

**ATTUALE**: Se operatore non risponde, user aspetta all'infinito
**CORRETTO**: Timeout 2 min → Proponi ticket o trova altro operatore

---

### ❌ Problema 6: Nessuna User Resume Notification

**ATTUALE**: Operatore non sa quando user riapre widget
**CORRETTO**: Emit 'user_resumed_chat' con badge 🟢 Online

---

### ❌ Problema 7: Deploy Non Completato

**ATTUALE**: Fix non deployed (hash diverso)
**CORRETTO**: Trigger manual redeploy su Render

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Stasera - 1h)

1. **Fix Deploy**
   - Trigger manual deploy su Render
   - Verify hash matches

2. **Add Operator Accept Endpoint**
   ```javascript
   POST /api/chat/sessions/:id/accept-operator
   Body: { operatorId }
   ```

3. **Fix requestOperator Flow**
   - Status → WAITING_OPERATOR (non WITH_OPERATOR)
   - Emit to all operators (non auto-assign)
   - Return { status: 'WAITING_OPERATOR' }

4. **Widget Waiting State**
   - Show "In attesa operatore..."
   - Disable input
   - Add cancel button
   - Listen for 'operator_joined' event

### Phase 2: Enhanced UX (Domani - 2h)

5. **User Resume Notification**
   - Add emit in getSession() when status=WITH_OPERATOR

6. **Timeout Management**
   - Background job: close WAITING_OPERATOR > 2 min
   - Emit 'operator_timeout' to widget

7. **System Messages in Widget**
   - Forward "{operatorName} joined" to widget
   - Show in chat feed (not just dashboard)

8. **Typing Indicator Fix**
   - Debug sessionId mismatch
   - Verify both directions

### Phase 3: Polish (Questa Settimana - 3h)

9. **Settings Integration**
   - Widget fetch texts from `/api/settings/widget-public`
   - Replace all hardcoded strings

10. **Session Expiry**
    - Auto-close sessions > 7 days
    - Show "Session expired" in widget

11. **Queue Position**
    - Show "Position in queue: 3"
    - Estimated wait time

---

## ✅ TESTING CHECKLIST (Dopo Implementation)

### Test 1: Request Operator Flow
- [ ] User clicca "Parla con operatore"
- [ ] Widget mostra "In attesa..."
- [ ] Input disabilitato
- [ ] Dashboard mostra notifica
- [ ] Operatore vede [Accetta Chat] button
- [ ] Operatore clicca Accetta
- [ ] Widget mostra "{nome} si è unito"
- [ ] Input riabilitato
- [ ] User può scrivere

### Test 2: Timeout Scenario
- [ ] User richiede operatore
- [ ] Nessuno accetta per 2 min
- [ ] Widget mostra "Nessun operatore..."
- [ ] Opzioni: [Apri Ticket] [Continua AI]

### Test 3: Cancel Request
- [ ] User richiede operatore
- [ ] User clicca [Annulla]
- [ ] Status torna ACTIVE
- [ ] Input riabilitato
- [ ] Può continuare con AI

### Test 4: User Resume
- [ ] User in chat WITH_OPERATOR
- [ ] User chiude widget
- [ ] User riapre dopo 5 min
- [ ] Dashboard mostra "User resumed"
- [ ] Badge 🟢 Online appare
- [ ] Notifica + suono

### Test 5: Real-time Both Ways
- [ ] Operator invia messaggio → User riceve
- [ ] User invia messaggio → Dashboard aggiorna
- [ ] Typing indicator funziona entrambe direzioni
- [ ] Badge unread funziona

---

**Status**: 📝 DOCUMENTO STRATEGICO COMPLETO
**Next**: Implementare Phase 1 (1h di lavoro)
**Priority**: 🔴 CRITICAL - Sistema non utilizzabile senza questi fix

