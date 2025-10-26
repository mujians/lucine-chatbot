# Lucine Chatbot - Roadmap Fix & Testing

**Creato**: 26 Ottobre 2025
**Status**: QA Analysis in corso

---

## 🎯 Strategia di Lavoro

### Fase 1: Fix Critici (P0/P1) ✅→🔄
Prima di testare a fondo, risolvere bug che bloccano funzionalità core.

### Fase 2: Testing Completo
Dopo fix P0/P1, procedere con testing sistematico di ogni feature.

### Fase 3: Miglioramenti UX (P2)
Improvement non bloccanti ma importanti per experience.

---

## 🔴 P0 - BLOCKERS (Fix Immediately)

### ✅ P0.1 - Config Backend Incompleto [RISOLTO]
- **Status**: ✅ FIXED & DEPLOYED (commit 1a9e3f7)
- **Issue**: OpenAI model/temperature/kb config erano undefined
- **Impact**: AI completamente non funzionante
- **Fix**: Ripristinato config completo da BACKUP
- **Deploy**: Push fatto, Render auto-deploying
- **Testing**: [ ] Verificare AI responses funzionano dopo deploy

---

## 🟠 P1 - HIGH PRIORITY (Fix Before Testing)

### 🔄 P1.1 - SMTP Settings Non Integrate
- **Status**: DA FARE
- **Issue**: SMTP settings in Settings UI ma non caricati da SystemSettings
- **Impact**: Email notifications non configurabili da Dashboard
- **File**: `backend/src/services/` (email service mancante o incompleto)
- **Fix Required**:
  1. Verificare se esiste email.service.js
  2. Implementare loading da SystemSettings (come fatto per Twilio)
  3. Testare invio email
- **Estimated Time**: 30-45 min
- **Blocca Testing**: Email notifications testing

### 🔄 P1.2 - Archive Button Mancante per Chat CLOSED
- **Status**: DA FARE
- **Issue**: Chat con status CLOSED non hanno button "Archive"
- **Impact**: Dashboard diventa cluttered, UX non ottimale
- **File**: `src/components/ChatList.tsx` o `ChatWindow.tsx`
- **Fix Required**:
  1. Aggiungere conditional render button "Archive" se status=CLOSED
  2. Collegare a API `POST /chat/sessions/:id/archive`
  3. Refresh lista dopo archive
- **Estimated Time**: 20-30 min
- **Blocca Testing**: Chat management flow testing

### 🔄 P1.3 - Confidence Threshold Source Unclear
- **Status**: DA VERIFICARE
- **Issue**: Settings UI ha `aiConfidenceThreshold` ma non chiaro se viene usato
- **Impact**: Setting potrebbe essere "fake" (non fa nulla)
- **File**: `backend/src/services/openai.service.js:143`
- **Investigation**:
  1. Verificare se `config.kb.confidenceThreshold` (ora presente) viene usato
  2. Oppure se serve caricare da SystemSettings
  3. Decidere: ENV var o DB setting?
- **Estimated Time**: 15 min investigation
- **Blocca Testing**: Operator suggestion logic testing

---

## 🟡 P2 - MEDIUM PRIORITY (Post-Testing)

### P2.1 - Widget Settings Cache
- **Issue**: Modifiche widget settings potrebbero non riflettersi immediatamente
- **Impact**: Confusione durante configurazione
- **Fix**: Implementare cache busting o auto-refresh
- **Estimated Time**: 1-2 ore

### P2.2 - Settings UI Organization
- **Issue**: Settings page ha troppi campi, UX confusa
- **Fix**: Separare in tabs (AI / Integrations / Widget / Notifications)
- **Estimated Time**: 2-3 ore

### P2.3 - Test Connection Buttons
- **Issue**: Non c'è modo di testare Twilio/SMTP credentials senza guardare logs
- **Fix**: Aggiungere "Test Connection" button per ogni integrazione
- **Estimated Time**: 1-2 ore

### P2.4 - Bulk Actions Chat Management
- **Issue**: Non si possono archiviare/chiudere multiple chat insieme
- **Fix**: Checkbox selection + bulk actions toolbar
- **Estimated Time**: 3-4 ore

---

## 📋 Testing Roadmap (After P1 Fixed)

### Test 1: Knowledge Base
- [ ] CRUD operations (Create/Read/Update/Delete)
- [ ] Toggle active/inactive
- [ ] Bulk import
- [ ] Embeddings generation
- [ ] AI usa KB nelle risposte (semantic search)
- [ ] Verify real-time sync con AI

**Estimated Time**: 1-2 ore

### Test 2: Chat → Ticket Flow
- [ ] User invia messaggio da widget
- [ ] AI risponde automaticamente
- [ ] Confidence bassa → suggest operator
- [ ] Operatore prende chat
- [ ] Conversazione continua
- [ ] Chiusura chat
- [ ] Archive chat
- [ ] Conversione a ticket

**Estimated Time**: 1-2 ore

### Test 3: WebSocket & Notifications
- [ ] Widget si connette via Socket.IO
- [ ] Messaggi real-time widget → dashboard
- [ ] Typing indicator
- [ ] WhatsApp notifications (se Twilio config)
- [ ] Email notifications (dopo P1.1 fix)
- [ ] Browser push notifications
- [ ] Operator notification preferences

**Estimated Time**: 1-2 ore

### Test 4: API & Error Handling
- [ ] Authentication flow (login/logout/token)
- [ ] 401 redirect to login
- [ ] 404 error handling
- [ ] 500 error fallback
- [ ] Network timeout handling
- [ ] Loading states
- [ ] Optimistic updates

**Estimated Time**: 1 ora

### Test 5: Admin UX Audit
- [ ] Dashboard navigation
- [ ] Filters & search
- [ ] Button placement/logic
- [ ] Missing actions identification
- [ ] Mobile responsiveness
- [ ] Accessibility

**Estimated Time**: 1-2 ore

---

## 📊 Current Status

### Completato
- [x] Settings integration analysis
- [x] P0 Config fix
- [x] QA Findings documentation
- [x] Deploy P0 fix

### In Corso
- [ ] P1 fixes
- [ ] Testing Knowledge Base

### Da Fare
- [ ] P1.1 - SMTP integration
- [ ] P1.2 - Archive button
- [ ] P1.3 - Confidence threshold verify
- [ ] Complete testing roadmap
- [ ] P2 improvements

---

## 🔄 How to Resume Work

Se devi riprendere questa roadmap in futuro:

1. **Leggi questo file** (`docs/ROADMAP.md`) - Stato aggiornato
2. **Leggi** `docs/QA_FINDINGS.md` - Dettagli tecnici issues
3. **Controlla** git log - Vedere cosa è stato fatto
4. **Verifica** Deploy status su Render.com
5. **Riprendi da** Prima task non completata in questo file

### Quick Resume Commands
```bash
cd /Users/brnobtt/Desktop/lucine-production

# Vedere stato progetto
git log --oneline -10
git status

# Vedere deploy status
# → Andare su https://dashboard.render.com

# Vedere issue da risolvere
cat docs/ROADMAP.md
cat docs/QA_FINDINGS.md

# Continuare da task P1.1 o primo [ ] non checked
```

---

## 📝 Maintenance

**IMPORTANTE**: Quando completi un task:
- [ ] Marca come ✅ in questo file
- [ ] Aggiorna `docs/QA_FINDINGS.md` se serve
- [ ] Commit changes con messaggio descrittivo
- [ ] Push a GitHub

**Esempio**:
```bash
# Dopo fix P1.1
vim docs/ROADMAP.md  # Mark P1.1 as ✅
vim docs/QA_FINDINGS.md  # Update status
git add -A
git commit -m "fix: SMTP settings integration with SystemSettings

- Load SMTP config from database
- Add email.service.js
- Update Settings controller

Closes P1.1 from roadmap.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

---

## 🎯 Priorità Decisionale

**Quando in dubbio**:
1. P0 sempre prima (blocca tutto)
2. P1 prima di testing estensivo
3. Testing dopo P1
4. P2 dopo testing completo

**Se tempo limitato**:
- Focus su P0/P1 + Testing critico (KB, Chat flow)
- P2 può aspettare

**Se serving production**:
- P0 immediato anche di notte
- P1 appena possibile
- Testing ASAP dopo P1

---

**Last Updated**: 26 Ottobre 2025
**Maintained by**: Claude Code
