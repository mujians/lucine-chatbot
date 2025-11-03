# ANALISI OLISTICA COMPLETA - TUTTI GLI SCENARI UX

## 📋 INDICE

1. [Stati del Sistema e Timeout](#stati-timeout)
2. [Scenari Utente Widget](#scenari-utente)
3. [Scenari Operatore Dashboard](#scenari-operatore)
4. [Flusso Ticket](#flusso-ticket)
5. [Flusso Rating](#flusso-rating)
6. [Bug Critici Identificati](#bug-critici)
7. [Lacune UX](#lacune-ux)
8. [Raccomandazioni](#raccomandazioni)

---

## 🔄 STATI DEL SISTEMA E TIMEOUT {#stati-timeout}

### Stati Possibili della Chat

```
ACTIVE            → Chat con AI attiva
WAITING           → In attesa che un operatore accetti
WITH_OPERATOR     → Chat con operatore in corso
CLOSED            → Chat chiusa
TICKET_CREATED    → Ticket creato dalla chat
```

### Tutti i Timeout del Sistema

| Timeout | Durata | Trigger | Azione | Cancellabile |
|---------|--------|---------|--------|--------------|
| **WAITING** | 5 min | Utente richiede operatore | Se nessuno accetta → torna ad ACTIVE, mostra opzioni | ✅ Quando operatore accetta |
| **OPERATOR_RESPONSE** | 10 min | Operatore accetta chat | Se operatore non invia primo messaggio → CLOSED | ✅ Quando operatore invia messaggio |
| **USER_INACTIVITY_WARNING** | 5 min | Chat WITH_OPERATOR | Mostra popup "Sei ancora qui?" | ✅ Quando utente invia messaggio |
| **USER_INACTIVITY_FINAL** | 5 min | Dopo warning non risposto | Auto-close chat → CLOSED | ✅ Quando utente conferma presenza |
| **USER_DISCONNECT** | 5 min | Utente disconnette da WITH_OPERATOR | Auto-close se non riconnette | ✅ Quando utente riconnette |
| **OPERATOR_DISCONNECT_GRACE** | 10 sec | Operatore disconnette | Notifica utente se non riconnette | ✅ Quando operatore riconnette |

---

## 👤 SCENARI UTENTE WIDGET {#scenari-utente}

### SCENARIO 1: Conversazione AI Standard

```
1. Utente apre widget (click bubble)
2. Widget mostra welcome message AI
3. Utente chatta con AI
4. AI risponde con OpenAI
5. Utente può:
   a) Continuare a chattare ✅
   b) Minimizzare widget (click X) ✅
   c) Chiudere definitivamente ❌ IMPOSSIBILE!
   d) Richiedere operatore ✅
```

**Feedback:** ✅ Tutto funziona
**Bug:** ❌ Utente non può terminare la conversazione, solo minimizzare

---

### SCENARIO 2A: Richiede Operatore → Operatori Disponibili

```
1. Utente clicca "Parla con un operatore" (da smart action AI)
2. POST /api/chat/session/{id}/request-operator
3. Backend:
   - Controlla operatori disponibili
   - Aggiorna status → WAITING
   - Emette chat_waiting_operator a dashboard
   - Avvia timeout WAITING (5 min)
4. Widget:
   - Chiama showWaitingForOperator()
   - Mostra UI: "⏳ In attesa di un operatore..."
   - Mostra bottone [ANNULLA]
   - Disabilita input
5. Operatore accetta (vedi Scenario Operatore 3)
6. Widget riceve operator_joined
7. Widget:
   - hideWaitingForOperator() ✅
   - isOperatorMode = true
   - Mostra form "Come ti chiami?"
   - Abilita input
   - Mostra bottone "🤖 Torna all'AI"
```

**Feedback:** ✅ Ottimo feedback in ogni fase
**Problemi:** Nessuno

---

### SCENARIO 2B: Richiede Operatore → Nessun Operatore Disponibile

```
1. Utente clicca "Parla con un operatore"
2. Backend risponde: { operatorAvailable: false, status: 'ACTIVE' }
3. Widget NON chiama showWaitingForOperator()
4. Widget mostra smart actions:
   - ❌ [Apri Ticket] → Crea ticket
   - 🤖 [Continua con AI] → Torna ad AI
```

**Feedback:** ✅ Chiaro
**UX:** ✅ Opzioni alternative immediate

---

### SCENARIO 2C: In Attesa → Utente Annulla

```
1. Utente in WAITING (vedi 2A)
2. Utente clicca [ANNULLA]
3. cancelOperatorRequest() chiamato
4. POST /api/chat/session/{id}/cancel-operator-request
5. Backend:
   - Aggiorna status → ACTIVE
   - Emette chat_request_cancelled a dashboard
   - Emette operator_request_cancelled al widget
   - Cancella timeout WAITING
6. Widget:
   - hideWaitingForOperator() ✅
   - Abilita input
   - Mostra messaggio: "Richiesta annullata"
```

**Feedback:** ✅ Perfetto
**UX:** ✅ Ottima

---

### SCENARIO 2D: In Attesa → Timeout 5 Minuti

```
1. Utente in WAITING per 5 minuti
2. Timeout WAITING scade
3. Backend:
   - Aggiorna status → ACTIVE
   - Emette operator_wait_timeout al widget
   - Emette chat_request_cancelled a dashboard
4. Widget riceve operator_wait_timeout
5. Widget mostra smart actions:
   - ❌ [Apri Ticket]
   - 🤖 [Continua con AI]
   - 🔁 [Riprova] ← Richiedi di nuovo
```

**Feedback:** ✅ Chiaro
**UX:** ✅ Ottima con opzioni

---

### SCENARIO 3: Chat con Operatore

```
1. Operatore si unisce (da 2A)
2. Widget mostra form "Come ti chiami?"
3. Utente inserisce nome e invia
4. POST /api/chat/session/{id}/user-name
   - Backend salva userName
   - Emette user_name_captured a dashboard
5. Utente può:
   a) Chattare con operatore ✅
   b) Tornare all'AI (click "🤖 Torna all'AI") ✅
   c) Minimizzare widget ✅
   d) Chiudere chat ❌ IMPOSSIBILE!
   e) Creare ticket manualmente ❌ NO UI
6. Operatore può:
   - Chattare
   - Chiudere chat → vedi Scenario 4
   - Trasferire chat
```

**Bug Critici:**
❌ Utente NON può chiudere la chat quando è con operatore
❌ Utente NON può creare ticket durante chat operatore

---

### SCENARIO 4A: Operatore Chiude Chat Normalmente

```
1. Operatore clicca [CHIUDI] nella dashboard
2. Backend:
   - Aggiorna status → CLOSED
   - Emette chat_closed a widget
   - Emette chat_closed a dashboard
3. Widget riceve chat_closed
4. Widget:
   - Mostra messaggio: "La chat è stata chiusa"
   - clearSessionStorage() ✅
   - sessionId = null
   - isOperatorMode = false
   - Disabilita input (placeholder: "Chat chiusa")
   - Mostra smart actions:
     a) 🔁 [Riapri Chat] → riapre entro 5 min
     b) 💬 [Nuova Chat] → nuova sessione
     c) ⭐ [Valuta] → rating popup
```

**Feedback:** ✅ Perfetto
**UX:** ✅ Opzioni chiare e complete

---

### SCENARIO 4B: Operatore Non Risponde (Timeout 10 min)

```
1. Operatore accetta ma NON invia primo messaggio per 10 minuti
2. Timeout OPERATOR_RESPONSE scade
3. Backend:
   - Aggiorna status → CLOSED
   - closureReason: 'OPERATOR_TIMEOUT'
   - Emette operator_not_responding al widget
   - Emette chat_timeout_cancelled all'operatore
4. Widget riceve operator_not_responding
5. Widget mostra smart actions:
   - ❌ [Apri Ticket]
   - 💬 [Nuova Chat]
   - 🤖 [Continua con AI]
```

**Feedback:** ✅ Chiaro
**UX:** ✅ Opzioni di recovery

---

### SCENARIO 4C: Operatore Disconnette (Grace 10 sec)

```
1. Operatore perde connessione (chiude dashboard, rete cade)
2. Backend avvia timeout OPERATOR_DISCONNECT_GRACE (10 sec)
3a. SE operatore riconnette entro 10 sec:
   - Timeout cancellato ✅
   - Chat continua normalmente ✅
3b. SE operatore NON riconnette:
   - Emette operator_disconnected al widget
4. Widget riceve operator_disconnected
5. Widget mostra smart actions:
   - 🔁 [Riprova] → richiedi altro operatore
   - ❌ [Apri Ticket]
   - 🤖 [Continua con AI]
```

**Feedback:** ✅ Buono
**UX:** Grace period ottimo per evitare falsi positivi

---

### SCENARIO 5A: Utente Inattivo 5 Minuti → Risponde

```
1. Utente in WITH_OPERATOR, non invia messaggi per 5 minuti
2. Timeout USER_INACTIVITY_WARNING scade
3. Backend:
   - Emette user_presence_check al widget
   - Emette user_inactivity_warning all'operatore
   - Avvia timeout USER_INACTIVITY_FINAL (altri 5 min)
4. Widget mostra popup:
   - "Sei ancora qui? Hai ancora bisogno di aiuto?"
   - Countdown visivo: 5:00 → 4:59 → ...
   - Bottoni:
     a) [Sì, sono qui] → conferma presenza
     b) [Continua con AI] → torna ad AI
5. Utente clicca [Sì, sono qui]
6. Socket emette user_confirmed_presence
7. Backend:
   - Cancella timeout USER_INACTIVITY_FINAL ✅
   - Resetta timer inattività (riavvia 5 min)
```

**Feedback:** ✅ Eccellente (countdown visivo!)
**UX:** ✅ Perfetta, non invasivo

---

### SCENARIO 5B: Utente Inattivo 10 Minuti → Non Risponde

```
1. Come 5A fino a step 4
2. Utente NON risponde per altri 5 minuti (10 min totali)
3. Timeout USER_INACTIVITY_FINAL scade
4. Backend:
   - Aggiorna status → CLOSED
   - closureReason: 'USER_INACTIVITY_TIMEOUT'
   - Emette chat_closed_inactivity al widget
   - Emette chat_auto_closed all'operatore
5. Widget riceve chat_closed_inactivity
6. Widget mostra smart actions:
   - 🔁 [Riapri Chat]
   - 💬 [Nuova Chat]
   - ⭐ [Valuta]
```

**Feedback:** ✅ Chiaro
**UX:** ✅ Ottima gestione inattività

---

### SCENARIO 6A: Utente Disconnette → Riconnette Entro 5 Min

```
1. Utente in WITH_OPERATOR, chiude tab/app
2. Socket disconnect
3. Backend:
   - Emette user_disconnected all'operatore
   - Avvia timeout USER_DISCONNECT (5 min)
4. Dashboard operatore vede: "L'utente si è disconnesso"
5. Utente riapre widget entro 5 minuti
6. Socket riconnette
7. Backend:
   - Cancella timeout USER_DISCONNECT ✅
   - Chat continua normalmente
8. Utente vede storico messaggi (localStorage) ✅
```

**Feedback:** ✅ Buono (operatore sa che utente disconnesso)
**UX:** ✅ Ottima resilienza

---

### SCENARIO 6B: Utente Disconnette → NON Riconnette

```
1. Come 6A fino a step 3
2. Utente NON riconnette per 5 minuti
3. Timeout USER_DISCONNECT scade
4. Backend:
   - Aggiorna status → CLOSED
   - closureReason: 'USER_DISCONNECTED_TIMEOUT'
   - Emette chat_auto_closed all'operatore
5. Operatore vede: "Chat chiusa automaticamente - utente non tornato"
```

**Feedback:** ✅ OK (operatore informato)
**UX:** Accettabile

---

### SCENARIO 7: Utente Torna all'AI Durante Chat Operatore

```
1. Utente in WITH_OPERATOR
2. Utente clicca bottone "🤖 Torna all'AI"
3. confirm() popup: "Vuoi tornare all'AI? L'operatore verrà disconnesso"
4. Utente conferma
5. POST /api/chat/session/{id}/return-to-ai
6. Backend:
   - Aggiorna status → ACTIVE
   - operatorId → null
   - Crea messaggio sistema
   - Emette user_returned_to_ai all'operatore
   - Emette chat_returned_to_ai alla dashboard
7. Widget:
   - isOperatorMode = false
   - Nasconde bottone "🤖 Torna all'AI"
   - Abilita input per AI
   - Mostra messaggio: "Sei tornato all'assistente AI"
```

**Feedback:** ✅ Conferma prima di switch
**UX:** ✅ Ottima, dà controllo all'utente

---

### SCENARIO 8: Riapri Chat Entro 5 Minuti

```
1. Chat chiusa (vedi Scenario 4A)
2. Utente clicca [Riapri Chat] entro 5 minuti
3. POST /api/chat/session/{id}/reopen
4. Backend:
   - Verifica: closedAt < 5 minuti fa
   - Aggiorna status → WITH_OPERATOR
   - Crea messaggio sistema
   - Emette chat_reopened a operatore e dashboard
5. Widget:
   - isOperatorMode = true
   - Ricarica storico messaggi
   - Mostra messaggio: "Chat riaperta"
   - Abilita input
```

**Feedback:** ✅ Chiaro
**UX:** ✅ Ottima feature per errori accidentali

**Limite:** Solo entro 5 minuti (limite backend)

---

## 👨‍💼 SCENARI OPERATORE DASHBOARD {#scenari-operatore}

### SCENARIO OP-1: Login e Disponibilità

```
1. Operatore login
2. Dashboard carica chats con status WAITING o WITH_OPERATOR
3. TopBar mostra toggle disponibilità:
   - Verde [Disponibile] → isAvailable = true
   - Grigio [Non Disponibile] → isAvailable = false
4. Se NON disponibile:
   - Banner giallo: "Sei NON disponibile per nuove chat"
   - NON riceve nuove chat requests
   - Può continuare chat già assegnate ✅
```

**Feedback:** ✅ Chiaro con banner
**UX:** ✅ Ottima

---

### SCENARIO OP-2: Riceve Richiesta Chat

```
1. Utente richiede operatore (vedi Scenario 2A)
2. Dashboard riceve chat_waiting_operator
3. Dashboard:
   - Chiama loadChats()
   - Chat appare in lista "Attive" con badge WAITING
   - Notifica browser + suono
   - In-app notification: "Nuova richiesta chat da {user}"
   - Badge counter +1
4. Operatore vede bottone [ACCETTA]
```

**Feedback:** ✅ Multiplo (browser, suono, badge, in-app)
**UX:** ✅ Impossibile perdere la notifica

---

### SCENARIO OP-3: Accetta Chat

```
1. Operatore clicca [ACCETTA]
2. handleAcceptChat() chiamato
3. POST /api/chat/sessions/{id}/accept-operator
4. Backend:
   - Aggiorna status → WITH_OPERATOR
   - operatorId = operatore corrente
   - Crea messaggio sistema
   - Emette operator_joined al widget
   - Emette chat_accepted a dashboard
   - Emette chat_request_cancelled ad altri operatori
   - Cancella timeout WAITING
   - Avvia timeout OPERATOR_RESPONSE (10 min)
5. Dashboard:
   - await loadChats() → ricarica lista
   - Trova chat aggiornata con status WITH_OPERATOR
   - setSelectedChat(chat) → apre chat automaticamente
   - Join socket room: join_chat
6. Operatore vede:
   - Chat aperta in pannello destro
   - Storico messaggi
   - Input abilitato
   - Bottoni: [CHIUDI] [TRASFERISCI]
```

**Feedback:** ✅ Immediato (chat si apre)
**Bug Fixed:** ✅ v2.3.6 risolve race condition

---

### SCENARIO OP-4: Chatta con Utente

```
1. Operatore scrive messaggio e invia
2. handleSendMessage() chiamato
3. Optimistic UI: messaggio aggiunto subito localmente
4. POST /api/chat/sessions/{id}/message
5. Backend:
   - Salva messaggio in DB
   - Emette operator_message a chat room
   - Emette operator_message a dashboard (skip mittente)
   - Cancella timeout OPERATOR_RESPONSE ✅
6. Widget riceve operator_message → aggiunge a chat
7. Dashboard riceve operator_message (altri operatori)
```

**Feedback:** ✅ Optimistic UI veloce
**UX:** ✅ Ottima performance

---

### SCENARIO OP-5: Chiude Chat

```
1. Operatore clicca [CHIUDI]
2. Confirm popup: "Chiudere la chat con {user}?"
3. Operatore conferma
4. socket.emit('close_chat', { sessionId, operatorId })
5. Backend:
   - Aggiorna status → CLOSED
   - Emette chat_closed al widget
   - Emette chat_closed alla dashboard
6. Dashboard:
   - loadChats() → ricarica lista
   - Chat scompare da "Attive", appare in "Chiuse"
   - setSelectedChat(null) → chiude pannello
```

**Feedback:** ✅ Conferma prima di chiudere
**UX:** ✅ Buona

---

### SCENARIO OP-6: Trasferisce Chat

```
1. Operatore clicca [TRASFERISCI]
2. Mostra lista altri operatori disponibili
3. Operatore seleziona destinatario
4. POST /api/chat/sessions/{id}/transfer
   body: { targetOperatorId }
5. Backend:
   - Aggiorna operatorId = target
   - Crea messaggio sistema
   - Emette chat_transferred a entrambi operatori
   - Emette operator_changed al widget
6. Dashboard origine:
   - Chat scompare dalla lista
7. Dashboard destinazione:
   - Chat appare come assegnata
   - Notifica: "Chat trasferita a te da {operatore}"
8. Widget:
   - Mostra messaggio: "Operatore cambiato"
   - Continua chat senza interruzione
```

**Feedback:** ✅ Notifiche a tutti i coinvolti
**UX:** ✅ Smooth transfer

---

### SCENARIO OP-7: Interviene in Chat AI

```
1. Dashboard mostra lista "Chat AI Attive" (status: ACTIVE)
2. Operatore clicca [INTERVIENI] su chat AI
3. POST /api/chat/sessions/{id}/intervene
   body: { operatorId }
4. Backend:
   - Aggiorna status → WITH_OPERATOR
   - operatorId = operatore
   - Crea messaggio sistema
   - Emette operator_joined al widget
   - Emette ai_chat_intervened alla dashboard
5. Dashboard:
   - Chat passa da "AI" a "Attive"
   - Chat si apre automaticamente
6. Widget riceve operator_joined
   - Passa a operator mode
   - Mostra form nome
```

**Feedback:** ✅ Chiaro
**UX:** ✅ Ottima per escalation AI → Human

---

### SCENARIO OP-8: Timeout Non Risponde (10 min)

```
1. Operatore accetta chat (Scenario OP-3)
2. Operatore NON invia nessun messaggio per 10 minuti
3. Timeout OPERATOR_RESPONSE scade
4. Backend:
   - Aggiorna status → CLOSED
   - Emette chat_timeout_cancelled all'operatore
   - Emette operator_not_responding al widget
5. Dashboard operatore:
   - Riceve chat_timeout_cancelled
   - Mostra messaggio sistema nella chat:
     "Questa chat è stata cancellata perché non hai risposto in tempo"
   - loadChats() → chat passa a "Chiuse"
   - Chat si chiude automaticamente
```

**Feedback:** ✅ Operatore informato del timeout
**Penalità:** Chat persa, user frustrato
**Raccomandazione:** Alert visivo/sonoro a 8-9 minuti

---

## 🎫 FLUSSO TICKET {#flusso-ticket}

### SCENARIO T-1: Utente Crea Ticket (Nessun Operatore)

```
1. Utente richiede operatore ma nessuno disponibile (Scenario 2B)
2. Utente clicca [Apri Ticket] da smart actions
3. showTicketForm() chiamato
4. Widget mostra form:
   - Nome (pre-filled se userName esiste)
   - Email (required, validated)
   - Messaggio (textarea)
   - [Annulla] [Invia messaggio]
5. Utente compila e clicca [Invia]
6. submitTicket() chiamato
7. Validazione:
   - Tutti campi pieni? ✅
   - Email valida? (regex) ✅
8. POST /api/tickets
   body: {
     sessionId,
     userName,
     contactMethod: 'EMAIL',
     email,
     initialMessage,
     priority: 'NORMAL'
   }
9. Backend:
   - Crea Ticket in DB
   - Aggiorna session: status = 'TICKET_CREATED'
   - Emette new_ticket_created alla dashboard
   - Invia email a team (opzionale)
10. Widget:
    - Rimuove form
    - Mostra: "✅ Ticket creato! Ti ricontatteremo via email"
    - Mostra smart actions:
      a) 🤖 [Continua con Lucy] → torna ad AI
      b) ❌ [Chiudi] → chiude widget
```

**Feedback:** ✅ Conferma visiva + email
**UX:** ✅ Ottima

**BUG:** ❌ Azione "Chiudi" (close_widget) NON implementata!
         → Falls through to unknown action, chiama solo removeAllActionContainers()

---

### SCENARIO T-2: Operatore Crea Ticket per Utente

```
1. Operatore in chat con utente
2. Operatore clicca [CREA TICKET] nella dashboard
3. Modal mostra form:
   - Nome utente (pre-filled)
   - Email (required)
   - Categoria (dropdown)
   - Priorità (LOW/NORMAL/HIGH/URGENT)
   - Messaggio
4. Operatore compila e invia
5. POST /api/tickets
6. Backend:
   - Crea Ticket
   - Aggiorna session status
   - Emette new_ticket_created
7. Dashboard:
   - Mostra conferma
   - Chat può continuare ✅ (status rimane WITH_OPERATOR)
```

**Feedback:** ✅ Conferma in dashboard
**UX:** ✅ Operatore può creare ticket senza chiudere chat

---

### SCENARIO T-3: Utente Vede Ticket in Dashboard (Feature Futura)

```
❌ NON IMPLEMENTATO
- Utente non ha accesso alla dashboard
- Utente non può vedere status ticket
- Utente non può commentare su ticket
- Tutto via email
```

**Lacuna UX:** ❌ Nessuna visibilità per l'utente
**Raccomandazione:** Portal utente o status page

---

## ⭐ FLUSSO RATING {#flusso-rating}

### SCENARIO R-1: Quando Viene Mostrato

Rating popup mostrato SOLO dopo chat con operatore chiusa:

**Trigger Events:**
- ✅ `chat_closed` (operatore chiude)
- ✅ `operator_disconnected` (operatore perde connessione)
- ✅ `operator_not_responding` (timeout 10 min)
- ✅ `chat_closed_inactivity` (utente inattivo 10 min)
- ❌ NOT after ticket creation
- ❌ NOT after AI-only chats
- ❌ NOT after return-to-AI

```
1. Evento di chiusura ricevuto
2. Widget salva closedSessionId
3. Widget mostra smart actions incluso:
   {
     icon: '⭐',
     text: 'Valuta',
     description: 'Valuta la tua esperienza',
     action: 'show_rating',
     data: { sessionId: closedSessionId }
   }
```

---

### SCENARIO R-2: Utente Lascia Rating

```
1. Utente clicca [Valuta] da smart actions
2. showRatingPopup(sessionId) chiamato
3. Check duplicati:
   - localStorage: ratedSessions.includes(sessionId)? → return
4. Widget mostra popup rating:
   - Overlay scuro (click outside non chiude)
   - Titolo: "Valuta la tua esperienza"
   - 5 stelle (hover effect, click to select)
   - Textarea commento (opzionale)
   - [Salta] [Invia] (Invia disabled until star selected)
5. Utente seleziona stelle e scrive commento
6. Utente clicca [Invia]
7. POST /api/chat/sessions/{sessionId}/rating
   body: { rating: 1-5, comment: "..." }
8. Backend:
   - Check duplicati: esistingRating? → 400 error
   - Crea ChatRating in DB:
     * sessionId
     * rating
     * comment
     * userId
     * userEmail
     * operatorId
     * operatorName
9. Widget:
   - Aggiunge sessionId a localStorage ratedSessions[]
   - Mostra "✅ Grazie per il feedback!" per 2 sec
   - Chiude popup automaticamente
```

**Feedback:** ✅ Conferma visiva + auto-close
**UX:** ✅ Perfetta

---

### SCENARIO R-3: Utente Skipa Rating

```
1. Come R-2 fino a step 4
2. Utente clicca [Salta]
3. Popup si chiude immediatamente
4. console.log('Rating skipped')
5. Nessuna traccia salvata
6. Utente può iniziare nuova chat o chiudere widget
```

**Feedback:** ✅ Immediato
**UX:** ✅ Non invasivo, nessuna penalità

---

### SCENARIO R-4: Tentativo Rating Duplicato

```
1. Utente clicca [Valuta] per sessione già rated
2. showRatingPopup() controlla localStorage
3. ratedSessions.includes(sessionId) === true
4. return; (popup non mostrato)
5. console.log('Rating already submitted')
```

**Protezione:** ✅ Client-side
**Backend:** ✅ Doppia protezione (DB unique constraint)

---

### SCENARIO R-5: Operatore Vede Rating

```
1. Rating creato (Scenario R-2)
2. Dashboard pagina /ratings
3. GET /api/ratings?operatorId={id}&dateFrom=...&dateTo=...
4. Backend restituisce:
   - totalRatings
   - averageRating
   - distribution: { 1: x, 2: x, 3: x, 4: x, 5: x }
   - operatorStats (ranking)
   - recent 50 ratings con commenti
5. Dashboard mostra:
   - Overview stats
   - Distribution chart (5-star breakdown)
   - Operator performance table
   - Recent ratings list con time-ago
```

**Feedback:** ✅ Analytics complete
**UX:** ✅ Ottima visibilità performance

---

## 🐛 BUG CRITICI IDENTIFICATI {#bug-critici}

### BUG #1: Utente Non Può Chiudere Chat ⚠️ CRITICO

**Problema:**
- Utente può solo MINIMIZZARE widget (click X)
- Utente NON può TERMINARE conversazione
- Session rimane aperta indefinitamente

**Impatto:**
- Sessioni zombie nel database
- Utente non può "ricominciare da capo"
- Confusione se utente vuole nuova conversazione

**Scenario Problematico:**
```
1. Utente chatta con AI
2. Utente vuole terminare → clicca X
3. Widget minimizza, session RIMANE ATTIVA
4. Utente riapre widget → vede vecchia conversazione
5. Utente confuso, non sa come iniziare nuova chat pulita
```

**Fix Richiesto:**
- Aggiungere bottone "Termina Chat" in header
- POST /api/chat/session/{id}/end (nuovo endpoint)
- Backend: status → CLOSED
- Widget: clearSessionStorage(), mostra welcome fresh

**Workaround Attuale:**
- Utente deve cancellare manualmente localStorage
- ❌ Inaccettabile per UX

---

### BUG #2: Azione "close_widget" Non Implementata ⚠️ MEDIO

**Problema:**
- Smart action "Chiudi" definita ma handler mancante
- Falls through a `else` case → chiama solo removeAllActionContainers()
- Widget NON si chiude effettivamente

**Location:**
- File: `chatbot-popup.liquid`
- Lines: 2952-2958 (definizione)
- Lines: 2249-2252 (handler mancante)

**Scenario Problematico:**
```
1. Dopo ticket creato, utente vede [Chiudi]
2. Utente clicca [Chiudi]
3. Bottoni smart actions scompaiono
4. Widget rimane APERTO
5. Utente deve cliccare manualmente X per minimizzare
```

**Fix Richiesto:**
```javascript
} else if (action.action === 'close_widget') {
  closePopup(); // Chiama funzione esistente
  removeAllActionContainers();
}
```

---

### BUG #3: Utente Non Può Creare Ticket Durante Chat Operatore ⚠️ BASSO

**Problema:**
- Durante chat WITH_OPERATOR, nessuna UI per creare ticket
- Utente deve chiedere all'operatore
- Operatore deve creare ticket manualmente

**Impatto:**
- Workflow inefficiente
- Utente dipende dall'operatore

**Fix Richiesto:**
- Aggiungere bottone "📝 Crea Ticket" in header durante operator mode
- Mostra form ticket anche quando isOperatorMode = true

---

## 🔍 LACUNE UX IDENTIFICATE {#lacune-ux}

### LACUNA #1: Nessun Feedback Visivo Timeout Operatore ⚠️ ALTO

**Problema:**
- Operatore ha 10 minuti per rispondere dopo accept
- Nessun alert/countdown a 8-9 minuti
- Operatore perde chat senza preavviso

**Impatto:**
- Operatore frustrato se distracted
- Utente riceve "operator not responding" improvvisamente

**Fix Raccomandato:**
- Alert giallo a 8 minuti: "Rispondi entro 2 minuti!"
- Countdown visivo a 9 minuti
- Suono/notifica browser

---

### LACUNA #2: Utente Non Vede Status Operatore Online ⚠️ MEDIO

**Problema:**
- Utente non sa se operatore è ancora connesso
- Utente non vede "typing..." dell'operatore
- Durante disconnessione operatore, 10 sec grace period silenzioso

**Impatto:**
- Utente incerto se operatore legge
- Attesa percepita più lunga

**Fix Raccomandato:**
- Indicatore "🟢 Operatore online" in header
- "⌨️ Operatore sta scrivendo..." durante typing
- Già implementato operator_typing event, ma non UI widget

---

### LACUNA #3: Nessun History/Transcript Download ⚠️ BASSO

**Problema:**
- Utente non può scaricare trascrizione chat
- Nessun "Invia transcript via email"

**Impatto:**
- Utente deve screenshottare manualmente
- Perdita reference dopo chiusura

**Fix Raccomandato:**
- Bottone "📧 Invia transcript" dopo chiusura
- POST /api/chat/session/{id}/send-transcript
- Email con full chat history

---

### LACUNA #4: Nessuna Stima Tempo Attesa ⚠️ BASSO

**Problema:**
- Durante WAITING, utente vede solo "In attesa..."
- Nessuna indicazione "~2 minuti" o posizione in coda

**Impatto:**
- Utente incerto quanto aspettare
- Più probabilità di cancel

**Fix Raccomandato:**
- Backend calcola avg response time
- Widget mostra "Tempo stimato: ~2 minuti"
- Aggiorna ogni 30 sec

---

### LACUNA #5: Nessun Survey Exit (CSAT) per AI-Only Chats ⚠️ BASSO

**Problema:**
- Rating solo per chat operatore
- Nessun feedback su qualità AI
- Nessun CSAT per conversazioni risolte da AI

**Impatto:**
- Impossibile misurare performance AI
- Impossibile migliorare prompts AI

**Fix Raccomandato:**
- Mostra rating anche dopo chiusura chat AI
- Domanda extra: "L'AI ha risolto il tuo problema?"
- Salva in tabella separata AIRating

---

## 📝 RACCOMANDAZIONI PRIORITARIE {#raccomandazioni}

### PRIORITÀ 1: Critiche (Implementare Subito)

1. **BUG #1: Aggiungere funzione "Termina Chat"**
   - Bottone in header widget
   - Endpoint /api/chat/session/{id}/end
   - Clear completo session e restart

2. **BUG #2: Fix azione close_widget**
   - 1 riga di codice
   - Impact immediato UX

3. **LACUNA #1: Alert timeout operatore**
   - Evita perdita chat
   - Migliora satisfaction operatore

---

### PRIORITÀ 2: Importanti (Prossimo Sprint)

4. **LACUNA #2: Status operatore online**
   - "Operatore online" indicator
   - "Sta scrivendo..." typing indicator UI

5. **BUG #3: Ticket da chat operatore**
   - Permetti utente creare ticket mentre chatta
   - Workflow più autonomo

6. **LACUNA #4: Stima tempo attesa**
   - Riduce anxiety utente
   - Riduce cancel rate

---

### PRIORITÀ 3: Nice-to-Have (Backlog)

7. **LACUNA #3: Transcript download**
8. **LACUNA #5: Rating AI chats**
9. Aggiungere portal utente per tracking ticket
10. Export chat analytics per operatori

---

## 📊 METRICHE SUGGERITE DA TRACCIARE

### User Experience Metrics
- **Avg time in WAITING** (target: <2 min)
- **WAITING → WITH_OPERATOR conversion rate** (target: >80%)
- **Cancel rate during WAITING** (target: <20%)
- **User satisfaction (CSAT)** (target: >4.0/5)
- **Ticket creation rate** (monitor trend)

### Operator Performance Metrics
- **Avg response time dopo accept** (target: <30 sec)
- **Timeout rate** (target: <5%)
- **Chats handled per operator per day**
- **Avg chat duration**
- **Rating per operator** (target: >4.0/5)

### System Health Metrics
- **User disconnect → reconnect rate**
- **Operator disconnect → reconnect rate**
- **Inactivity auto-close rate**
- **AI → Operator escalation rate**
- **AI resolution rate** (quando implementato rating AI)

---

## 🎯 CONCLUSIONI

### Punti di Forza del Sistema Attuale ✅

1. **Timeout Management**: Eccellente con grace periods
2. **Feedback Multi-Layer**: Notifiche browser + in-app + badge
3. **Resilienza**: Gestione disconnect/reconnect robusta
4. **Recovery Options**: Sempre alternative dopo errori
5. **Operator Workflow**: Dashboard efficiente e completa
6. **Rating System**: Ben implementato con anti-duplicate

### Aree di Miglioramento Critico ❌

1. **Utente non può terminare chat** → BUG #1
2. **Mancanza feedback real-time su status operatore** → LACUNA #2
3. **Nessun alert timeout operatore** → LACUNA #1

### Note Implementazione

Questo documento mappa **TUTTI** i 30+ scenari possibili.
Ogni percorso è stato tracciato dal trigger iniziale alla risoluzione.

Per ogni scenario sono indicati:
- ✅ Feedback presente
- ❌ Feedback mancante
- 🐛 Bug identificati
- 💡 Suggerimenti miglioramento

**Prossimi Step:**
1. Fix BUG #1 (terminazione chat utente)
2. Fix BUG #2 (close_widget handler)
3. Implementare LACUNA #1 (alert timeout operatore)
4. Testing completo di ogni scenario

---

**Documento creato:** 2025-01-03
**Versione sistema:** v2.3.6
**Autore analisi:** Claude Code
**Status:** ✅ Completo e pronto per implementation
