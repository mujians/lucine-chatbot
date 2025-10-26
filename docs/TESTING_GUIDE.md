# Lucine Chatbot - Guida Test e QA

**Data**: 26 Ottobre 2025
**Versione**: 2.0

## Indice

1. [Setup Ambiente di Test](#setup-ambiente-di-test)
2. [Test Dashboard Operatore](#test-dashboard-operatore)
3. [Test Widget Chat](#test-widget-chat)
4. [Test Integrazioni](#test-integrazioni)
5. [Test Configurazione](#test-configurazione)
6. [Checklist Completa](#checklist-completa)
7. [Bug Reporting](#bug-reporting)

---

## Setup Ambiente di Test

### Prerequisiti
- [ ] Accesso dashboard operatore (email + password)
- [ ] URL dashboard: `https://[your-app].onrender.com`
- [ ] URL widget: `https://[your-shopify-store].myshopify.com`
- [ ] Browser aggiornato (Chrome/Firefox/Safari)
- [ ] Developer tools aperte per verificare console errors

### Login Dashboard
1. Andare su `https://[your-app].onrender.com/login`
2. Inserire credenziali operatore
3. Verificare redirect a `/` (Chat List)
4. Verificare sidebar visibile con tutte le voci

### Verifica Database
```bash
# Se hai accesso al database, verifica tabelle principali:
SELECT COUNT(*) FROM "ChatSession";
SELECT COUNT(*) FROM "Ticket";
SELECT COUNT(*) FROM "Operator";
SELECT COUNT(*) FROM "KnowledgeItem";
SELECT COUNT(*) FROM "CannedResponse";
SELECT COUNT(*) FROM "SystemSettings";
```

---

## Test Dashboard Operatore

### 1. Test Chat Management

#### 1.1 Visualizzazione Chat List
- [ ] Aprire Dashboard > Chat
- [ ] Verificare presenza chat di test (o creare nuova da widget)
- [ ] Verificare colonne: Nome utente, Status, Last message, Timestamp
- [ ] Verificare badge status colorati (ACTIVE, WITH_OPERATOR, CLOSED)

#### 1.2 Filtri Chat
- [ ] **Status Filter**: Selezionare "ACTIVE" → verificare solo chat attive mostrate
- [ ] **Status Filter**: Selezionare "WITH_OPERATOR" → verificare solo chat con operatore
- [ ] **Status Filter**: Selezionare "CLOSED" → verificare solo chat chiuse
- [ ] **Search**: Digitare nome utente → verificare filtro real-time
- [ ] **Date Range**: Selezionare range → verificare filtro date
- [ ] **Archive Filter**: Toggle "Show Archived" → verificare chat archiviate
- [ ] **Flag Filter**: Toggle "Show Flagged" → verificare chat flaggate

#### 1.3 Apertura Chat
- [ ] Click su una chat nella lista
- [ ] Verificare apertura Chat Window a destra
- [ ] Verificare visualizzazione storico messaggi
- [ ] Verificare scroll automatico a ultimo messaggio
- [ ] Verificare differenziazione balloon (user, ai, operator, system)

#### 1.4 Invio Messaggi Operatore
- [ ] Digitare messaggio nella input box
- [ ] Premere Enter (o click Send)
- [ ] Verificare messaggio aggiunto alla chat
- [ ] Verificare messaggio salvato in database
- [ ] Verificare widget riceve messaggio in tempo reale (se aperto)
- [ ] Verificare typing indicator su widget

#### 1.5 Risposte Rapide (Canned Responses)
- [ ] Digitare `/` nella chat input
- [ ] Verificare apertura dropdown risposte rapide
- [ ] Verificare search filtra risposte
- [ ] Selezionare una risposta
- [ ] Verificare testo inserito in input
- [ ] Modificare testo se necessario
- [ ] Inviare messaggio
- [ ] Verificare messaggio inviato correttamente

#### 1.6 Chiusura Chat
- [ ] Aprire chat ACTIVE o WITH_OPERATOR
- [ ] Click su "Close Chat" button
- [ ] Verificare modal conferma (se presente)
- [ ] Confermare chiusura
- [ ] Verificare:
  - [ ] Status cambiato a "CLOSED"
  - [ ] Messaggio sistema "La chat è stata chiusa..."
  - [ ] Widget riceve notifica chiusura
  - [ ] Chat rimossa da lista ACTIVE
  - [ ] Chat compare in lista CLOSED

#### 1.7 Transfer Chat
- [ ] Aprire chat WITH_OPERATOR assegnata a te
- [ ] Click su "Transfer" button
- [ ] Selezionare operatore target (deve essere online e available)
- [ ] Opzionalmente inserire motivo
- [ ] Confermare transfer
- [ ] Verificare:
  - [ ] Chat assegnata a nuovo operatore
  - [ ] Messaggio sistema "Chat trasferita da ... a ..."
  - [ ] Notifica al nuovo operatore (se connesso)
  - [ ] Chat rimossa dalla tua lista
  - [ ] Chat compare in lista nuovo operatore

#### 1.8 Flag/Unflag Chat
- [ ] Aprire una chat qualsiasi
- [ ] Click su "Flag" button
- [ ] Inserire reason opzionale
- [ ] Verificare:
  - [ ] Chat marcata come flagged (icona/badge in lista)
  - [ ] Reason salvato
  - [ ] FlaggedBy = operatore corrente
- [ ] Click su "Unflag"
- [ ] Verificare flag rimosso

#### 1.9 Archive/Unarchive Chat
- [ ] Aprire chat CLOSED
- [ ] Click su "Archive"
- [ ] Verificare:
  - [ ] Chat rimossa da lista principale
  - [ ] Chat compare in "Show Archived"
  - [ ] ArchivedBy = operatore corrente
- [ ] Attivare "Show Archived"
- [ ] Click su "Unarchive"
- [ ] Verificare chat ripristinata

#### 1.10 Delete Chat (Soft Delete)
- [ ] Aprire una chat di test
- [ ] Click su "Delete" (se disponibile)
- [ ] Confermare eliminazione
- [ ] Verificare:
  - [ ] Chat rimossa dalla lista
  - [ ] Chat non compare in filtri
  - [ ] Database: deletedAt != null

#### 1.11 Real-time Updates
**Setup**: Aprire due browser/finestre, login con due operatori diversi
- [ ] Operatore 1: Aprire chat list
- [ ] Utente: Aprire widget, inviare messaggio
- [ ] Verificare:
  - [ ] Nuova chat compare in lista Operatore 1 in real-time
  - [ ] Badge "NEW" o highlight
- [ ] Operatore 1: Assegnare chat a se stesso
- [ ] Operatore 2: Verificare chat assegnata scompare/cambia status
- [ ] Operatore 1: Chiudere chat
- [ ] Operatore 2: Verificare status aggiornato a CLOSED

---

### 2. Test Ticket Management

#### 2.1 Visualizzazione Ticket List
- [ ] Aprire Dashboard > Tickets
- [ ] Verificare colonne: Subject, Status, Priority, Contact, Created
- [ ] Verificare badge colorati per status e priority

#### 2.2 Filtri Ticket
- [ ] **Status Filter**: Testare OPEN, IN_PROGRESS, RESOLVED, CLOSED
- [ ] **Priority Filter**: Testare LOW, MEDIUM, HIGH, URGENT
- [ ] **Search**: Cercare in subject/description
- [ ] **Date Range**: Filtrare per data creazione

#### 2.3 Apertura Ticket
- [ ] Click su ticket nella lista
- [ ] Verificare visualizzazione dettagli:
  - [ ] Subject, description
  - [ ] Contact method (WhatsApp/Email) e value
  - [ ] Status, priority
  - [ ] Operatore assegnato
  - [ ] Timeline eventi

#### 2.4 Cambio Status Ticket
- [ ] Aprire ticket OPEN
- [ ] Click su dropdown Status
- [ ] Selezionare "IN_PROGRESS"
- [ ] Verificare:
  - [ ] Status aggiornato
  - [ ] Timestamp aggiornato
  - [ ] Badge cambiato in lista
- [ ] Ripetere per RESOLVED e CLOSED

#### 2.5 Cambio Priority Ticket
- [ ] Aprire ticket qualsiasi
- [ ] Click su dropdown Priority
- [ ] Cambiare priority (es. MEDIUM → HIGH)
- [ ] Verificare:
  - [ ] Priority aggiornata
  - [ ] Badge colorato cambiato

#### 2.6 Assegnazione Operatore
- [ ] Aprire ticket non assegnato
- [ ] Click su "Assign to me"
- [ ] Verificare operatore assegnato
- [ ] Click su "Reassign"
- [ ] Selezionare altro operatore
- [ ] Verificare cambio assegnazione

#### 2.7 Creazione Ticket da Widget
- [ ] Aprire widget su Shopify
- [ ] Richiedere operatore quando nessuno disponibile
  - [ ] Impostare tutti operatori isAvailable = false
  - [ ] O disconnettere tutti operatori
- [ ] Verificare prompt "Vuoi aprire un ticket?"
- [ ] Click "Sì" (o equivalente)
- [ ] Compilare form ticket:
  - [ ] Subject
  - [ ] Description
  - [ ] Contact method (WhatsApp o Email)
  - [ ] Contact value
- [ ] Inviare
- [ ] Verificare:
  - [ ] Ticket creato in database
  - [ ] Ticket compare in Ticket List
  - [ ] Widget mostra conferma
  - [ ] Email/WhatsApp inviato (se integrazione attiva)

---

### 3. Test Operator Management

#### 3.1 Visualizzazione Operatori
- [ ] Aprire Dashboard > Operatori
- [ ] Verificare lista operatori
- [ ] Verificare colonne: Name, Email, Role, Status (Online/Offline)
- [ ] Verificare badge isAvailable

#### 3.2 Creazione Operatore
- [ ] Click "Add Operator"
- [ ] Compilare form:
  - [ ] Name
  - [ ] Email (unico)
  - [ ] Password
  - [ ] Role (ADMIN/OPERATOR/VIEWER)
- [ ] Salvare
- [ ] Verificare operatore in lista
- [ ] Provare login con nuove credenziali

#### 3.3 Modifica Operatore
- [ ] Click su operatore esistente
- [ ] Modificare name
- [ ] Modificare role
- [ ] Salvare
- [ ] Verificare modifiche applicate

#### 3.4 Toggle isAvailable
- [ ] Click su toggle "Available" per un operatore
- [ ] Verificare:
  - [ ] Badge cambiato
  - [ ] Database isAvailable aggiornato
  - [ ] Se messo a false: operatore non riceve nuove chat
- [ ] Test: Impostare isAvailable = false per tutti
- [ ] Widget: Richiedere operatore
- [ ] Verificare fallback a ticket

#### 3.5 Reset Password
- [ ] Click su operatore
- [ ] Click "Reset Password"
- [ ] Inserire nuova password
- [ ] Salvare
- [ ] Logout
- [ ] Login con nuova password
- [ ] Verificare accesso riuscito

#### 3.6 Eliminazione Operatore
- [ ] Click su operatore di test
- [ ] Click "Delete"
- [ ] Confermare
- [ ] Verificare operatore rimosso da lista

#### 3.7 Statistiche Operatore
- [ ] Verificare per ogni operatore:
  - [ ] Total chats handled
  - [ ] Online status
  - [ ] Last active timestamp

---

### 4. Test Knowledge Base

#### 4.1 Accesso Knowledge Base
- [ ] Verificare link in sidebar (icona BookOpen)
- [ ] Click su "Knowledge Base"
- [ ] Verificare apertura pagina Knowledge

#### 4.2 Visualizzazione Q&A Items
- [ ] Verificare lista items
- [ ] Verificare colonne: Question, Category, Active status
- [ ] Verificare filtri per category

#### 4.3 Creazione Knowledge Item
- [ ] Click "Add Knowledge Item"
- [ ] Compilare:
  - [ ] Question
  - [ ] Answer (textarea)
  - [ ] Category
  - [ ] isActive = true
- [ ] Salvare
- [ ] Verificare item in lista

#### 4.4 Modifica Knowledge Item
- [ ] Click su item esistente
- [ ] Modificare question e answer
- [ ] Salvare
- [ ] Verificare modifiche applicate

#### 4.5 Disattivazione Knowledge Item
- [ ] Click su toggle "Active"
- [ ] Verificare item disattivato
- [ ] Test AI: Inviare query correlata da widget
- [ ] Verificare item disattivato NON usato dall'AI

#### 4.6 Eliminazione Knowledge Item
- [ ] Click su item di test
- [ ] Click "Delete"
- [ ] Confermare
- [ ] Verificare item rimosso

#### 4.7 Test RAG (Retrieval Augmented Generation)
**Setup**: Creare knowledge item specifico
- [ ] Aggiungere Q&A:
  - Question: "Qual è l'orario di apertura del negozio?"
  - Answer: "Siamo aperti tutti i giorni dalle 10:00 alle 20:00"
  - Active: true
- [ ] Salvare
- [ ] Aprire widget
- [ ] Inviare: "Quando aprite?"
- [ ] Verificare:
  - [ ] AI risponde con info corretta da KB
  - [ ] Confidence score alto
  - [ ] Non suggerisce operatore

---

### 5. Test Canned Responses

#### 5.1 Visualizzazione Risposte Rapide
- [ ] Aprire Dashboard > Risposte Rapide
- [ ] Verificare lista canned responses
- [ ] Verificare colonne: Title, Shortcut, Category

#### 5.2 Creazione Canned Response
- [ ] Click "Add Canned Response"
- [ ] Compilare:
  - [ ] Title: "Saluto iniziale"
  - [ ] Content: "Ciao! Come posso aiutarti?"
  - [ ] Shortcut: "ciao"
  - [ ] Category: "Greetings"
- [ ] Salvare
- [ ] Verificare in lista

#### 5.3 Utilizzo Canned Response
- [ ] Aprire una chat
- [ ] Digitare `/` nella input
- [ ] Verificare dropdown con risposte
- [ ] Digitare `/ciao`
- [ ] Verificare autocompletamento
- [ ] Selezionare risposta
- [ ] Verificare testo inserito
- [ ] Inviare messaggio

#### 5.4 Search Canned Responses
- [ ] In chat, digitare `/` seguito da parte del titolo
- [ ] Verificare filtro funziona
- [ ] Digitare carattere inesistente
- [ ] Verificare lista vuota

#### 5.5 Modifica/Eliminazione
- [ ] Modificare una canned response
- [ ] Verificare modifiche salvate
- [ ] Eliminare canned response di test
- [ ] Verificare rimossa

---

### 6. Test Analytics

#### 6.1 Overview Dashboard
- [ ] Aprire Dashboard > Statistiche
- [ ] Verificare cards principali:
  - [ ] Total Chats (periodo corrente)
  - [ ] Total Tickets
  - [ ] Active Operators
  - [ ] Average Response Time

#### 6.2 Grafici
- [ ] Verificare presenza grafici:
  - [ ] Chats over time (line chart)
  - [ ] Tickets by status (pie/bar chart)
  - [ ] Operator performance
- [ ] Verificare data picker funziona
- [ ] Cambiare range date
- [ ] Verificare aggiornamento grafici

#### 6.3 Export (se disponibile)
- [ ] Click "Export Report"
- [ ] Verificare download CSV/PDF
- [ ] Verificare dati corretti nel file

---

### 7. Test System Status

#### 7.1 Visualizzazione Status
- [ ] Aprire Dashboard > System Status
- [ ] Verificare status servizi:
  - [ ] Database: Connected/Disconnected
  - [ ] OpenAI API: Healthy/Error
  - [ ] WebSocket: Active/Inactive

#### 7.2 Metrics
- [ ] Verificare metriche:
  - [ ] Uptime
  - [ ] Active connections
  - [ ] Request rate
  - [ ] Error rate

#### 7.3 Operatori Online
- [ ] Verificare lista operatori connessi
- [ ] Aprire seconda finestra, login altro operatore
- [ ] Verificare nuovo operatore in lista
- [ ] Logout operatore
- [ ] Verificare rimosso da lista

---

### 8. Test Settings (Configurazione)

#### 8.1 AI Settings

##### 8.1.1 OpenAI API Key
- [ ] Aprire Dashboard > Impostazioni
- [ ] Scroll a "AI Settings"
- [ ] Verificare campo API Key (mascherato)
- [ ] Modificare API Key
- [ ] Salvare
- [ ] Test: Inviare messaggio da widget
- [ ] Verificare AI risponde (se key valida) o errore (se invalida)

##### 8.1.2 Model Selection
- [ ] Cambiare model da gpt-4 a gpt-3.5-turbo
- [ ] Salvare
- [ ] Verificare backend usa nuovo model
- [ ] Test: Inviare messaggio, verificare risposta

##### 8.1.3 Temperature
- [ ] Modificare temperatura (es. da 0.7 a 0.3)
- [ ] Salvare
- [ ] Test: Inviare stessa domanda multiple volte
- [ ] Verificare risposte meno variabili con temperatura bassa

##### 8.1.4 Confidence Threshold
- [ ] Modificare soglia (es. da 0.7 a 0.9)
- [ ] Salvare
- [ ] Test: Inviare domanda generica
- [ ] Verificare AI suggerisce operatore più facilmente

##### 8.1.5 AI System Prompt
- [ ] Scroll a campo "AI System Prompt" (textarea)
- [ ] Verificare prompt corrente
- [ ] Modificare prompt, es:
  ```
  Sei Lucy, assistente di Lucine di Natale.
  Rispondi in modo divertente e amichevole.
  Usa emoji quando appropriato.
  ```
- [ ] Salvare
- [ ] **IMPORTANTE**: Verificare salvataggio in database
  ```sql
  SELECT value FROM "SystemSettings" WHERE key = 'aiSystemPrompt';
  ```
- [ ] Test: Inviare messaggio da widget
- [ ] Verificare AI usa nuovo prompt (tono/stile diverso)
- [ ] Verificare emoji se richiesto nel prompt

#### 8.2 Widget Colors

##### 8.2.1 Header Color
- [ ] Modificare "Widget Header Color" (color picker)
- [ ] Selezionare nuovo colore (es. #dc2626 → #3b82f6)
- [ ] Salvare
- [ ] **NOTA**: Attualmente hardcoded nel widget Liquid
- [ ] Per test completo: Modificare chatbot-popup.liquid manualmente

##### 8.2.2 Altri Colori
Testare tutti i color pickers:
- [ ] User Balloon Color
- [ ] Operator Balloon Color
- [ ] AI Balloon Color
- [ ] Send Button Color
- [ ] Background Color
- [ ] Input Background Color
- [ ] Text Color

**Procedura**:
1. Modificare colore
2. Salvare
3. Verificare valore hex salvato correttamente
4. Verificare database:
   ```sql
   SELECT value FROM "SystemSettings" WHERE key = 'widgetHeaderColor';
   ```

#### 8.3 Widget Layout

##### 8.3.1 Position
- [ ] Cambiare "Widget Position" da "right" a "left"
- [ ] Salvare
- [ ] Verificare database aggiornato
- [ ] **NOTA**: Richiede modifica Liquid per applicare

##### 8.3.2 Title & Subtitle
- [ ] Modificare "Widget Title" (es. "Chat con Lucy")
- [ ] Modificare "Widget Subtitle" (es. "Assistenza 24/7")
- [ ] Salvare
- [ ] Verificare database
- [ ] **NOTA**: Richiede modifica Liquid per applicare

#### 8.4 Widget Messages

**Per ogni campo message**:
1. Modificare testo
2. Salvare
3. Verificare database aggiornato
4. **NOTA**: Attualmente hardcoded nel widget

##### 8.4.1 Initial Messages
- [ ] Widget Greeting: "Ciao! Come posso aiutarti?"
- [ ] Widget Placeholder: "Scrivi un messaggio..."

##### 8.4.2 System Messages
- [ ] Operator Joined: "{operatorName} si è unito alla chat"
- [ ] Operator Left: "{operatorName} ha lasciato la chat"
- [ ] Chat Closed: "La chat è stata chiusa. Grazie!"
- [ ] Typing Indicator: "Sta scrivendo..."

##### 8.4.3 Action Messages
- [ ] Request Operator Prompt: "Vuoi parlare con un operatore?"
- [ ] No Operator Available: "Nessun operatore disponibile. Vuoi aprire un ticket?"
- [ ] Ticket Created: "Ticket creato! Ti contatteremo presto."

##### 8.4.4 Ticket Form Messages
- [ ] Form Title: "Apri un Ticket"
- [ ] Form Description: "Lasciaci i tuoi dati..."
- [ ] Contact Method Label: "Come preferisci essere contattato?"
- [ ] WhatsApp Label: "WhatsApp"
- [ ] Email Label: "Email"
- [ ] Message Label: "Descrivi il problema"
- [ ] Submit Button: "Invia"
- [ ] Cancel Button: "Annulla"

#### 8.5 Integrations

##### 8.5.1 WhatsApp (Twilio)
- [ ] Inserire Twilio Account SID
- [ ] Inserire Auth Token
- [ ] Inserire WhatsApp Number
- [ ] Salvare
- [ ] Verificare database
- [ ] **Test completo**: Richiede implementazione webhook

##### 8.5.2 Email (SMTP)
- [ ] Inserire SMTP Host
- [ ] Inserire SMTP Port
- [ ] Inserire SMTP User
- [ ] Inserire SMTP Password
- [ ] Inserire Email From
- [ ] Salvare
- [ ] **Test completo**: Richiede implementazione invio email

#### 8.6 Save & Load Settings
- [ ] Modificare multiple settings
- [ ] Click "Save Settings"
- [ ] Verificare messaggio conferma "Settings saved successfully"
- [ ] Refresh pagina
- [ ] Verificare tutte le settings caricate correttamente dal database
- [ ] Verificare nessuna perdita dati

---

## Test Widget Chat

### 9. Test Widget su Shopify

#### 9.1 Verifica Widget Presente
- [ ] Aprire store Shopify
- [ ] Verificare presenza widget in bottom-right (o left se configurato)
- [ ] Verificare icona chat visibile
- [ ] Verificare click apre widget

#### 9.2 Invio Primo Messaggio
- [ ] Aprire widget
- [ ] Verificare greeting message: "Ciao! Sono Lucy..."
- [ ] Digitare messaggio: "Ciao"
- [ ] Premere Send
- [ ] Verificare:
  - [ ] Messaggio utente appare
  - [ ] Typing indicator appare
  - [ ] Risposta AI arriva
  - [ ] Chat session creata in database

#### 9.3 Conversazione AI
- [ ] Inviare domanda generica: "Cosa vendete?"
- [ ] Verificare:
  - [ ] AI risponde
  - [ ] Se domanda in KB: risposta accurata
  - [ ] Se domanda non in KB: risposta generica
  - [ ] Confidence score calcolato

#### 9.4 Request Operator - Manuale
- [ ] Nel widget, inviare: "Voglio parlare con una persona"
- [ ] Verificare:
  - [ ] AI risponde: "Ti metto in contatto con un operatore"
  - [ ] Button "Request Operator" appare
  - [ ] Click su button
  - [ ] **Se operatore disponibile**:
    - [ ] Messaggio "Operatore assegnato"
    - [ ] Status chat → WITH_OPERATOR
    - [ ] Dashboard: Chat appare in lista operatore
    - [ ] Notifica operatore (se connesso)
  - [ ] **Se nessun operatore disponibile**:
    - [ ] Messaggio "Nessun operatore disponibile"
    - [ ] Prompt "Vuoi aprire un ticket?"

#### 9.5 Request Operator - Auto-suggest
- [ ] Inviare domanda vaga: "Ho un problema"
- [ ] Verificare:
  - [ ] AI risponde ma ha bassa confidence
  - [ ] Suggerisce operatore: "Vuoi parlare con un operatore?"
  - [ ] Button "Request Operator" appare

#### 9.6 Chat con Operatore
**Setup**: Operatore online e available
- [ ] Utente: Richiedere operatore
- [ ] Dashboard: Verificare chat assegnata
- [ ] Dashboard: Aprire chat, inviare messaggio
- [ ] Widget: Verificare messaggio operatore ricevuto
- [ ] Widget: Rispondere
- [ ] Dashboard: Verificare messaggio utente ricevuto
- [ ] Verificare typing indicator in entrambe le direzioni

#### 9.7 Chiusura Chat da Operatore
- [ ] Dashboard: Chiudere chat
- [ ] Widget: Verificare:
  - [ ] Messaggio sistema "La chat è stata chiusa..."
  - [ ] Input disabilitata (o nascosta)
  - [ ] Button "Start New Chat" appare

#### 9.8 Creazione Ticket da Widget
- [ ] Impostare tutti operatori isAvailable = false (o disconnettere)
- [ ] Widget: Richiedere operatore
- [ ] Verificare messaggio "Nessun operatore disponibile"
- [ ] Click "Apri Ticket" (o equivalente)
- [ ] Verificare form ticket:
  - [ ] Campo Subject
  - [ ] Campo Description
  - [ ] Radio: WhatsApp / Email
  - [ ] Campo Contact Value
  - [ ] Button Submit / Cancel
- [ ] Compilare form:
  - Subject: "Problema con ordine"
  - Description: "Il mio ordine non è arrivato"
  - Contact: WhatsApp
  - Value: "+39 123 456 7890"
- [ ] Inviare
- [ ] Verificare:
  - [ ] Messaggio conferma "Ticket creato!"
  - [ ] Widget si chiude (o mostra messaggio successo)
  - [ ] Dashboard: Ticket appare in Ticket List
  - [ ] Ticket ha tutti i dati corretti

#### 9.9 WebSocket Reconnection
- [ ] Aprire widget, iniziare conversazione
- [ ] **Simulare disconnessione**: Disattivare WiFi o chiudere backend
- [ ] Widget: Inviare messaggio
- [ ] Verificare errore o messaggio "Connessione persa"
- [ ] **Ripristinare connessione**: Riattivare WiFi o backend
- [ ] Verificare widget si riconnette automaticamente
- [ ] Verificare messaggi in coda vengono inviati

#### 9.10 Multiple Chat Sessions
- [ ] Aprire widget, iniziare chat (Session A)
- [ ] Chiudere widget
- [ ] Aprire nuovo browser/incognito
- [ ] Aprire widget, iniziare nuova chat (Session B)
- [ ] Verificare:
  - [ ] Due chat sessions separate in database
  - [ ] Messaggi non si mischiano
  - [ ] Dashboard mostra entrambe le chat

---

## Test Integrazioni

### 10. Test OpenAI Integration

#### 10.1 API Key Validation
- [ ] Settings: Inserire API key invalida
- [ ] Salvare
- [ ] Widget: Inviare messaggio
- [ ] Verificare:
  - [ ] Errore in console backend
  - [ ] Fallback response all'utente
  - [ ] Suggest operator

#### 10.2 Rate Limiting
- [ ] Inviare molti messaggi rapidamente (10+ in 1 minuto)
- [ ] Verificare:
  - [ ] OpenAI potrebbe rate limit
  - [ ] Backend gestisce errore
  - [ ] Utente riceve messaggio di errore appropriato

#### 10.3 Embeddings Generation
**NOTA**: Attualmente preparato per pgvector, non completamente implementato
- [ ] Creare knowledge item
- [ ] Verificare log backend: "Generating embeddings..."
- [ ] Verificare embedding salvato (se implementato)

### 11. Test WhatsApp Integration (Quando Implementato)
- [ ] Configurare Twilio credentials
- [ ] Creare ticket con WhatsApp contact
- [ ] Verificare messaggio WhatsApp inviato
- [ ] Rispondere via WhatsApp
- [ ] Verificare messaggio ricevuto in dashboard

### 12. Test Email Integration (Quando Implementato)
- [ ] Configurare SMTP settings
- [ ] Creare ticket con Email contact
- [ ] Verificare email inviata
- [ ] Verificare contenuto email corretto

---

## Checklist Completa

### Pre-Deploy Checklist
- [ ] Database migrations applicate
- [ ] Environment variables configurate
- [ ] OpenAI API key valida
- [ ] Build frontend senza errori
- [ ] Backend server starts correttamente
- [ ] WebSocket server attivo

### Post-Deploy Checklist
- [ ] URL dashboard accessibile
- [ ] Login funziona
- [ ] Database connesso
- [ ] OpenAI API raggiungibile
- [ ] Widget carica su Shopify
- [ ] WebSocket connessione attiva

### Smoke Test (Test Rapido Post-Deploy)
1. [ ] Login dashboard
2. [ ] Aprire widget, inviare messaggio
3. [ ] Verificare risposta AI
4. [ ] Dashboard: Verificare chat appare
5. [ ] Inviare messaggio da dashboard
6. [ ] Widget: Verificare messaggio ricevuto
7. [ ] Chiudere chat
8. [ ] Creare knowledge item
9. [ ] Testare risposta AI usa KB
10. [ ] Creare canned response
11. [ ] Usare canned response in chat
12. [ ] Verificare analytics funziona
13. [ ] Verificare system status verde

### Regression Test (Dopo Modifiche)
Ogni volta che si modifica codice, testare:
- [ ] Login/Logout
- [ ] Chat send/receive
- [ ] Operator assignment
- [ ] Chat close
- [ ] Ticket creation
- [ ] Settings save/load
- [ ] WebSocket real-time

---

## Bug Reporting

### Template Segnalazione Bug

```markdown
**Titolo**: [Breve descrizione del problema]

**Tipo**: Bug / Feature Request / Question

**Priorità**: Low / Medium / High / Critical

**Descrizione**:
[Descrizione dettagliata del problema]

**Steps to Reproduce**:
1. Andare a...
2. Click su...
3. Vedere errore...

**Expected Behavior**:
[Cosa dovrebbe succedere]

**Actual Behavior**:
[Cosa succede invece]

**Screenshots**:
[Se possibile, allegare screenshot]

**Environment**:
- Browser: Chrome 120
- OS: macOS 14
- Dashboard URL: https://...
- Timestamp: 2025-10-26 14:30

**Console Errors**:
[Eventuali errori da Developer Console]

**Additional Notes**:
[Altre informazioni rilevanti]
```

### Priorità Bug
- **Critical**: Sistema non funziona, perdita dati, sicurezza
- **High**: Feature principale non funziona, workaround difficile
- **Medium**: Feature secondaria non funziona, workaround disponibile
- **Low**: Problema estetico, miglioramento UX

---

## Test Automation (Opzionale)

### Unit Tests
```bash
# Backend
cd backend
npm test

# Frontend
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests (Cypress/Playwright)
```bash
npm run test:e2e
```

---

**Ultimo aggiornamento**: 26 Ottobre 2025
**Maintained by**: Claude Code

Per domande o problemi durante i test, contattare il team di sviluppo.
