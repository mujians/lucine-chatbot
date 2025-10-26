# Knowledge Base - Testing Report

**Data**: 26 Ottobre 2025
**Testato da**: QA Analysis
**Status**: ⚠️ FUNZIONANTE ma con limitazioni

---

## ✅ CRUD Operations - FUNZIONANTE

### Backend API

#### GET /api/knowledge
- **Status**: ✅ Working
- **Features**:
  - Filtri: `category`, `isActive`, `search`
  - Include creator info (name)
  - Order by createdAt DESC
- **File**: `backend/src/controllers/knowledge.controller.js:8-45`

#### GET /api/knowledge/:itemId
- **Status**: ✅ Working
- **File**: `knowledge.controller.js:51-84`

#### POST /api/knowledge
- **Status**: ⚠️ Working BUT embeddings not saved
- **Issue**: Genera embedding ma NON lo salva in DB
- **Code**:
  ```javascript
  // Line 103: embedding generato
  embedding = await generateEmbedding(question + ' ' + answer);

  // Line 115: NOT SAVED!
  // Note: embedding would be set here if pgvector is configured
  ```
- **Impact**: Embeddings vengono persi
- **File**: `knowledge.controller.js:90-137`

#### PUT /api/knowledge/:itemId
- **Status**: ⚠️ Working BUT embeddings not saved
- **Issue**: Stesso problema del CREATE
- **File**: `knowledge.controller.js:143-192`

#### DELETE /api/knowledge/:itemId
- **Status**: ✅ Working
- **File**: `knowledge.controller.js:198-216`

#### PATCH /api/knowledge/:itemId/toggle
- **Status**: ✅ Working
- **Purpose**: Toggle isActive status
- **File**: `knowledge.controller.js:222-251`

#### POST /api/knowledge/bulk
- **Status**: ⚠️ Working BUT no embeddings generated
- **Issue**: Bulk import non genera embeddings affatto
- **File**: `knowledge.controller.js:257-304`

#### POST /api/knowledge/regenerate-embeddings
- **Status**: ✅ Working
- **Purpose**: Genera e SALVA embeddings per tutti gli items
- **Note**: Questo è l'UNICO metodo che salva embeddings in DB
- **File**: `knowledge.controller.js:310-369`

---

### Frontend UI

#### Knowledge.tsx
- **Status**: ✅ Working
- **Features**:
  - Lista items con filtri
  - Create/Edit form
  - Button "Rigenera Embeddings"
  - Error handling UI
- **File**: `src/pages/Knowledge.tsx`

#### Filtri Disponibili
- ✅ Category filter
- ✅ isActive filter (attivo/inattivo)
- ✅ Search (backend implementato)

#### Actions
- ✅ Nuovo Documento (Create)
- ✅ Edit item
- ✅ Toggle active/inactive
- ✅ Delete (presumo in KnowledgeList)
- ✅ Rigenera Embeddings (button con loading state)

---

## ⚠️ AI INTEGRATION - LIMITATA

### Embeddings Generation

**Status**: ⚠️ **PARTIALLY WORKING**

#### Cosa Funziona
- ✅ `generateEmbedding()` chiama OpenAI API correttamente
- ✅ `regenerateAllEmbeddings()` salva embeddings in DB
- ✅ Model: 'text-embedding-3-small' (config fix P0)

#### Cosa NON Funziona
- ❌ CREATE non salva embedding in DB
- ❌ UPDATE non salva embedding in DB
- ❌ BULK IMPORT non genera embeddings
- ⚠️ Embedding field in schema ma mai popolato (eccetto regenerate)

#### Root Cause
```javascript
// knowledge.controller.js:115
const item = await prisma.knowledgeItem.create({
  data: {
    question,
    answer,
    category: category || 'ALTRO',
    isActive: true,
    createdBy: req.operator.id,
    // Note: embedding would be set here if pgvector is configured
    // ❌ MISSING: embedding: embedding
  },
});
```

**Soluzione**: Aggiungere `embedding: JSON.stringify(embedding)` al data object

---

### Semantic Search

**Status**: ❌ **NOT IMPLEMENTED**

#### Current Implementation
```javascript
// openai.service.js:30-58
export async function searchKnowledgeBase(query, maxResults = 5) {
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // ❌ BUT: usa text search, NON similarity search
  const results = await prisma.knowledgeItem.findMany({
    where: {
      isActive: true,
      OR: [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } },
      ],
    },
    // ❌ NO similarity search with embeddings
  });

  return results;
}
```

#### TODO (già documentato)
```javascript
// Line 36: TODO: Implement pgvector similarity search when ready
```

#### Impact
- AI usa **keyword search** invece di semantic search
- Embeddings generati ma MAI usati per search
- Qualità ricerca KB inferiore (no sinonimi, no concetti simili)

---

## 🔍 Testing Checklist

### Manual Testing Required

#### CRUD Operations
- [ ] **Create**: Creare nuovo item da Dashboard
  - Expected: Item creato con successo
  - Check: Embedding NON salvato in DB (issue noto)

- [ ] **Read**: Visualizzare lista items
  - Expected: Items mostrati con filtri funzionanti

- [ ] **Update**: Modificare question/answer esistente
  - Expected: Item aggiornato
  - Check: Embedding NON salvato in DB (issue noto)

- [ ] **Delete**: Eliminare item
  - Expected: Item eliminato da lista

- [ ] **Toggle**: Attivare/disattivare item
  - Expected: Status isActive cambia

#### Filtri
- [ ] Filtrare per category
- [ ] Filtrare per isActive
- [ ] Search bar (se implementato in UI)

#### Bulk Import
- [ ] Importare CSV/JSON con multiple items
- [ ] Verificare validazione dati
- [ ] Check: NO embeddings generati (issue noto)

#### Embeddings
- [ ] Click "Rigenera Embeddings"
- [ ] Verificare progress/loading state
- [ ] Verificare success message con count
- [ ] Check DB: embeddings salvati come JSON string

### AI Integration Testing

#### Knowledge Base Usage in Chat
- [ ] Creare KB item con question/answer
- [ ] Inviare messaggio dal widget correlato
- [ ] Verificare AI risponde usando KB item
- [ ] **Expected**: Text search funziona (keyword match)
- [ ] **NOT Expected**: Semantic search (concetti simili)

#### Example Test Case
```
KB Item:
Q: "Quali sono gli orari di apertura del negozio?"
A: "Siamo aperti Lun-Ven 9-18, Sab 9-13"

Test Query 1: "orari negozio"
→ ✅ SHOULD MATCH (keyword)

Test Query 2: "quando siete aperti?"
→ ❌ MAY NOT MATCH (no semantic search)

Test Query 3: "a che ora aprite?"
→ ❌ LIKELY NO MATCH (different keywords)
```

---

## 🐛 Issues Summary

### P1 - High Priority

#### P1.4 - Embeddings Not Saved on CREATE/UPDATE
- **Impact**: Embeddings generati ma persi
- **Workaround**: Usare "Rigenera Embeddings" dopo create/update
- **Fix Required**:
  ```javascript
  // knowledge.controller.js:115 e 169
  const item = await prisma.knowledgeItem.create({
    data: {
      // ... existing fields
      embedding: embedding ? JSON.stringify(embedding) : null,  // ADD THIS
    },
  });
  ```

#### P1.5 - Bulk Import No Embeddings
- **Impact**: Import massivo non genera embeddings
- **Fix Required**: Generare embeddings in loop come regenerateAllEmbeddings

### P2 - Medium Priority

#### P2.5 - Semantic Search Not Implemented
- **Impact**: AI search limitata a keyword matching
- **Future Enhancement**: Implement pgvector similarity search
- **Requirement**: PostgreSQL con pgvector extension
- **Effort**: 4-6 ore development

---

## 📊 Conclusion

### Funziona ✅
- CRUD operations base
- UI completa con filtri
- Regenerate embeddings button
- Text-based KB search in AI
- Admin-only write protection

### Limitazioni ⚠️
- Embeddings non salvati su create/update (P1)
- Semantic search non implementata (P2)
- Bulk import senza embeddings (P1)

### Raccomandazioni

**Short-term** (Fix P1.4 e P1.5):
1. Aggiungere save embedding in createKnowledgeItem
2. Aggiungere save embedding in updateKnowledgeItem
3. Aggiungere generate+save embeddings in bulkImport
4. Estimated time: 1-2 ore

**Long-term** (P2.5):
1. Setup PostgreSQL con pgvector extension
2. Update searchKnowledgeBase con similarity search
3. Migrate embedding storage format se necessario
4. Estimated time: 4-6 ore

---

**Test Completato**: 26/10/2025
**Next**: Testing Chat → Ticket Flow
