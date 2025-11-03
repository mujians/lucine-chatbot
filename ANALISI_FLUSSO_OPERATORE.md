# ANALISI COMPLETA FLUSSO RICHIESTA OPERATORE

## SCENARIO 1: Utente richiede operatore → Operatore A accetta

### FASE 1: Richiesta dal Widget
```
┌─────────────────────────────────────────────────────────────┐
│ WIDGET (utente clicca "Parla con operatore")               │
├─────────────────────────────────────────────────────────────┤
│ 1. POST /api/chat/session/{id}/request-operator            │
│ 2. Backend risponde: { status: 'WAITING' }                 │
│ 3. Widget chiama showWaitingForOperator()                  │
│ 4. Mostra UI: "In attesa di un operatore..." [ANNULLA]     │
│ 5. Disabilita input                                         │
└─────────────────────────────────────────────────────────────┘
```

### FASE 2: Backend processa richiesta
```
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (requestOperator controller)                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Aggiorna DB: status = 'WAITING'                         │
│ 2. Emette a dashboard: chat_waiting_operator                │
│ 3. Emette al widget: operator_request_sent                 │
│ 4. Avvia timeout 60s (auto-cancel se nessuno accetta)      │
└─────────────────────────────────────────────────────────────┘
```

### FASE 3: Dashboard mostra richiesta
```
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD (tutti gli operatori disponibili)                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Riceve chat_waiting_operator                             │
│ 2. Chiama loadChats()                                       │
│ 3. Mostra chat in lista "WAITING" con bottone [ACCETTA]    │
│ 4. Notifica browser + suono                                 │
│ 5. Badge counter +1                                         │
└─────────────────────────────────────────────────────────────┘
```

### FASE 4: Operatore A clicca ACCETTA
```
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD - Operatore A                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Clicca [ACCETTA]                                         │
│ 2. handleAcceptChat(chat) chiamata                          │
│ 3. POST /api/chat/sessions/{id}/accept-operator            │
│    body: { operatorId: "A" }                                │
│ 4. Apre automaticamente la chat (setSelectedChat)          │
│ 5. Join chat room via socket                                │
└─────────────────────────────────────────────────────────────┘
```

### FASE 5: Backend processa accettazione ❌ PROBLEMA QUI
```
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (acceptOperator controller) - EVENTI EMESSI         │
├─────────────────────────────────────────────────────────────┤
│ 1. Aggiorna DB:                                             │
│    - status = 'WITH_OPERATOR'                               │
│    - operatorId = A                                         │
│    - operatorAssignedAt = now                               │
│                                                              │
│ 2. Crea messaggio sistema: "Operatore X si è unito"        │
│                                                              │
│ 3. Emette al WIDGET:                                        │
│    ✅ io.to(`chat_{sessionId}`).emit('operator_joined')    │
│                                                              │
│ 4. Emette alla DASHBOARD (TUTTI):                           │
│    ✅ io.to('dashboard').emit('chat_accepted')             │
│                                                              │
│ 5. Emette alla DASHBOARD (TUTTI): ❌ PROBLEMA!              │
│    ❌ io.to('dashboard').emit('chat_request_cancelled')    │
│    → Reason: 'accepted_by_another_operator'                 │
│    → VA ANCHE ALL'OPERATORE A CHE HA ACCETTATO!            │
│                                                              │
│ 6. Cancella timeout WAITING                                 │
│ 7. Avvia timeout OPERATOR_RESPONSE (10 min)                │
│ 8. Avvia inactivity check utente (5 min warning)           │
└─────────────────────────────────────────────────────────────┘
```

### FASE 6: Dashboard riceve eventi (RACE CONDITION)
```
┌────────────────────────────────────────────────────────────────┐
│ DASHBOARD - Operatore A (ha accettato)                         │
├────────────────────────────────────────────────────────────────┤
│ 1. Riceve chat_accepted:                                       │
│    - console.log('✅ Chat accepted by operator')              │
│    - Chiama loadChats() → carica chat con status WITH_OPERATOR│
│    - Chat appare nella lista "Attive"                          │
│                                                                 │
│ 2. Riceve chat_request_cancelled: ❌ PROBLEMA!                 │
│    - console.log('🚫 Chat request cancelled')                 │
│    - Chiama loadChats() di NUOVO → possibile race condition   │
│    - Possibile rimozione della chat appena accettata          │
│    - Confusione nello stato UI                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ DASHBOARD - Operatori B, C, D (non hanno accettato)            │
├────────────────────────────────────────────────────────────────┤
│ 1. Ricevono chat_accepted:                                     │
│    - Chiama loadChats()                                        │
│    - Chat scompare dalla lista WAITING (corretto)             │
│                                                                 │
│ 2. Ricevono chat_request_cancelled:                            │
│    - Chiama loadChats() di nuovo                               │
│    - Chat già rimossa, doppia chiamata inutile ma non dannosa  │
└────────────────────────────────────────────────────────────────┘
```

### FASE 7: Widget riceve operatore
```
┌─────────────────────────────────────────────────────────────┐
│ WIDGET (utente)                                              │
├─────────────────────────────────────────────────────────────┤
│ 1. Riceve operator_joined:                                  │
│    - console.log('👤 Operator joined')                      │
│    - isOperatorMode = true                                  │
│    - Chiama hideWaitingForOperator() ✅                     │
│    - Rimuove UI "In attesa..."                              │
│    - Mostra form "Come ti chiami?"                          │
│    - Abilita input per chattare                             │
│    - Update header con nome operatore                       │
│    - Mostra bottone "🤖 Torna all'AI"                       │
│                                                              │
│ 2. NON riceve chat_request_cancelled                        │
│    (emesso solo a 'dashboard' room) ✅ Corretto             │
└─────────────────────────────────────────────────────────────┘
```

---

## SCENARIO 2: Utente ANNULLA la richiesta

### Widget
```
1. Utente clicca [ANNULLA]
2. POST /api/chat/session/{id}/cancel-operator-request
3. Backend risponde OK
4. Chiama hideWaitingForOperator()
5. Abilita input
6. Mostra messaggio: "Richiesta annullata"
```

### Backend
```
1. Aggiorna DB: status = 'ACTIVE'
2. Emette a dashboard: chat_request_cancelled
   → Reason: 'cancelled_by_user'
3. Emette al widget: operator_request_cancelled
4. Cancella timeout WAITING
```

### Dashboard (tutti)
```
1. Riceve chat_request_cancelled
2. Chiama loadChats()
3. Chat scompare dalla lista WAITING ✅
```

---

## SCENARIO 3: Timeout 60s scade senza accettazione

### Backend (timeout automatico)
```
1. Timeout scade dopo 60s
2. Aggiorna DB: status = 'ACTIVE'
3. Emette a dashboard: chat_request_cancelled
   → Reason: 'timeout'
4. Emette al widget: operator_request_cancelled
```

### Widget
```
1. Riceve operator_request_cancelled
2. hideWaitingForOperator()
3. Mostra: "Nessun operatore disponibile. Continua con AI."
```

---

## 🔴 PROBLEMA IDENTIFICATO

### Issue: Race condition in FASE 5-6

Quando operatore accetta, il backend emette a TUTTA la dashboard:
- `chat_accepted`
- `chat_request_cancelled`

L'operatore che ha accettato riceve ENTRAMBI gli eventi e chiama `loadChats()` DUE VOLTE in rapida successione.

**Conseguenze:**
1. Race condition tra le due chiamate API
2. Possibile rimozione della chat appena accettata
3. UI confusa
4. Chat rimane WAITING invece di WITH_OPERATOR
5. Widget rimane bloccato in "In attesa..." perché non riceve operator_joined correttamente

---

## ✅ SOLUZIONI PROPOSTE

### Soluzione 1: Evento diverso per altri operatori
Usare un nuovo evento `chat_taken_by_another` invece di riutilizzare `chat_request_cancelled`.

```javascript
// Backend
io.to('dashboard').emit('chat_accepted', { sessionId, operatorId });
io.to('dashboard').emit('chat_taken_by_another', {
  sessionId,
  takenBy: operatorId
});
```

Dashboard filtra:
```javascript
socket.on('chat_taken_by_another', (data) => {
  if (data.takenBy !== operator?.id) {
    loadChats(); // Solo altri operatori ricaricano
  }
});
```

### Soluzione 2: Broadcast selettivo
Backend emette `chat_request_cancelled` solo agli operatori che NON hanno accettato.

```javascript
// Backend - usa socket broadcast
socket.broadcast.to('dashboard').emit('chat_request_cancelled', {
  sessionId,
  reason: 'accepted_by_another_operator'
});
```

### Soluzione 3: Dashboard ignora evento se è l'operatore
Dashboard controlla se l'operatore corrente è quello che ha accettato.

```javascript
socket.on('chat_request_cancelled', (data) => {
  if (data.reason === 'accepted_by_another_operator') {
    // Ignora se ho appena accettato io
    if (selectedChat?.id === data.sessionId && selectedChat?.operatorId === operator?.id) {
      return;
    }
  }
  loadChats();
});
```

---

## 🎯 RACCOMANDAZIONE

**Implementare Soluzione 2 + Soluzione 3** per massima robustezza:

1. Backend usa broadcast per non inviare a chi ha accettato
2. Dashboard ha logica defensiva per ignorare eventi non pertinenti
3. Mantiene retrocompatibilità con altri scenari

Questo garantisce:
- Nessuna race condition
- Eventi semanticamente corretti
- Comportamento prevedibile
- Codice più mantenibile
