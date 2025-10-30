# 📚 Documentation Cleanup Roadmap

**Problema**: Troppi file .md disorganizzati, duplicati, obsoleti
**Obiettivo**: Struttura chiara, aggiornata, manutenibile

---

## 🎯 STRUTTURA TARGET

```
/lucine-production/
│
├── START_HERE.md                    # ⭐ ENTRY POINT (2 min read)
├── README.md                        # Project overview
├── PROJECT_CRITICAL_INFO.md         # Git, database, deploy dettagliato
│
├── docs/
│   ├── README.md                    # Index di tutti i docs
│   │
│   ├── 01_SETUP/
│   │   ├── git-structure.md
│   │   ├── local-development.md
│   │   └── environment-variables.md
│   │
│   ├── 02_ARCHITECTURE/
│   │   ├── database-schema.md
│   │   ├── message-table-migration.md
│   │   ├── websocket-events.md
│   │   └── api-endpoints.md
│   │
│   ├── 03_FEATURES/
│   │   ├── operator-request-flow.md
│   │   ├── file-uploads.md
│   │   ├── internal-notes.md
│   │   └── analytics.md
│   │
│   ├── 04_DEPLOY/
│   │   ├── backend-deploy.md
│   │   ├── dashboard-deploy.md
│   │   ├── widget-deploy.md
│   │   └── troubleshooting.md
│   │
│   ├── 05_TESTING/
│   │   ├── test-scenarios.md
│   │   └── testing-session-reports/
│   │
│   └── 99_ARCHIVE/
│       └── [vecchi file obsoleti]
│
└── backend/
    ├── README.md                    # Backend-specific docs
    └── docs/
        ├── controllers-guide.md
        ├── migrations-guide.md
        └── websocket-service.md
```

---

## 📋 TASK LIST

### Phase 1: Consolidamento (2h)

**1.1 Identificare duplicati**:
- [ ] DEPLOY_INFO.md vs PROJECT_CRITICAL_INFO.md → Merge
- [ ] OPERATOR_REQUEST_FLOW_FIX.md vs backend/OPERATOR_FLOW_CHANGES_TO_REDO.md → Merge
- [ ] Vari CRITICAL_BUGS_ANALYSIS.md vs ISSUES_FOUND.md → Archive

**1.2 Creare struttura cartelle**:
```bash
mkdir -p docs/{01_SETUP,02_ARCHITECTURE,03_FEATURES,04_DEPLOY,05_TESTING,99_ARCHIVE}
```

**1.3 Spostare file**:
- Setup: Git, env, local dev
- Architecture: Schema, WebSocket, API
- Features: Ogni feature un file
- Deploy: Per component
- Testing: Reports
- Archive: Tutto il vecchio

### Phase 2: Aggiornamento (1h)

**2.1 README.md principale**:
- Quick start
- Struttura progetto
- Link a START_HERE.md
- Link a docs/README.md

**2.2 docs/README.md index**:
- Lista tutti i file
- Breve descrizione
- Status (✅ Updated / ⚠️ Partial / ❌ Obsolete)

**2.3 Aggiornare file critici**:
- [ ] database-schema.md (Message table)
- [ ] operator-request-flow.md (WAITING state)
- [ ] websocket-events.md (nuovi eventi)
- [ ] api-endpoints.md (accept-operator, cancel-operator-request)

### Phase 3: Manutenzione (ongoing)

**3.1 Regole**:
- ✅ Aggiornare file esistenti, NON creare nuovi
- ✅ Un file per feature
- ✅ Data ultimo aggiornamento in header
- ✅ Status badge (Updated/Partial/Obsolete)
- ✅ Link incrociati

**3.2 Template file .md**:
```markdown
# Feature Name

**Status**: ✅ Updated | ⚠️ Partial | ❌ Obsolete
**Last Updated**: 30 Ottobre 2025
**Related**: [link], [link]

---

## Overview
...

## Implementation
...

## Testing
...

## Related Files
...
```

---

## 🗑️ FILE DA ARCHIVIARE

```
docs/99_ARCHIVE/
├── ACTIONS_AND_SCENARIOS.md           # Obsoleto
├── DASHBOARD_FIXES_NEEDED.md          # Obsoleto
├── ISSUES_FOUND.md                    # Merged in altri
├── TEST_PLAN_END_TO_END.md            # Obsoleto
├── CRITICAL_OPERATOR_MESSAGE_BUG.md   # Risolto
├── DOCUMENTATION_INCONGRUENCIES.md    # Obsoleto
├── ISSUES_TYPING_AND_NOTIFICATIONS.md # Obsoleto
├── CURRENT_STATUS.md                  # Obsoleto
└── [altri vecchi]
```

---

## ✅ FILE DA TENERE AGGIORNATI (Critical)

1. **START_HERE.md** - Entry point, sempre aggiornato
2. **PROJECT_CRITICAL_INFO.md** - Info tecniche dettagliate
3. **docs/02_ARCHITECTURE/database-schema.md** - Schema DB
4. **docs/02_ARCHITECTURE/websocket-events.md** - Eventi
5. **docs/02_ARCHITECTURE/api-endpoints.md** - API reference
6. **docs/03_FEATURES/operator-request-flow.md** - Feature principale
7. **docs/04_DEPLOY/** - Guide deploy per component

---

## 🔄 WORKFLOW AGGIORNAMENTO

**Quando modifichi codice**:

1. ✅ Identifica quale file .md riguarda
2. ✅ Aggiorna QUEL file (non crearne uno nuovo)
3. ✅ Aggiorna data + status
4. ✅ Se grande modifica, aggiorna START_HERE.md

**Quando crei feature nuova**:

1. ✅ Un file in `docs/03_FEATURES/nome-feature.md`
2. ✅ Aggiungi a docs/README.md index
3. ✅ Link da START_HERE.md se critica

---

## 📊 METRICHE SUCCESSO

- ⬇️ Numero file .md da 50+ a ~20
- ✅ Tutti i file hanno status badge
- ✅ Tutti i file hanno data aggiornamento
- ✅ Nessun duplicato
- ✅ Struttura cartelle chiara
- ⬆️ Facilità ritrovare info (2 click max)

---

## 🚀 PRIORITÀ

**P0 - Oggi**: START_HERE.md (fatto ✅)
**P1 - Domani**: Phase 1 (consolidamento)
**P2 - Questa settimana**: Phase 2 (aggiornamento)
**P3 - Ongoing**: Phase 3 (manutenzione)

---

**Responsabile**: Claude (con user approval)
**Timeline**: 3h totali
**Beneficio**: No più confusione, info sempre aggiornate
