# Knowledge Base - Formato Documenti

**Creato**: 26 Ottobre 2025

---

## 📝 Formato Singolo Documento

La Knowledge Base supporta due modalità:

### 1. FAQ Style (Domanda + Risposta)
```json
{
  "question": "Come posso modificare il mio ordine?",
  "answer": "Per modificare un ordine contatta il servizio clienti entro 24h...",
  "category": "ORDINI"
}
```

### 2. Document Style (Solo Contenuto)
```json
{
  "title": "Informazioni Aziendali",
  "content": "Fondata nel 2020, la nostra azienda si occupa di...",
  "category": "INFO"
}
```

**Nota**: Il campo `title`/`question` è **opzionale**, mentre `content`/`answer` è **obbligatorio**.

---

## 📤 Bulk Import - Formati Supportati

### CSV Format

**Struttura**:
```csv
title,content,category
"Chi siamo","Azienda fondata nel 2020, ci specializziamo in vendita online di prodotti...",INFO
"Spedizioni","Le spedizioni vengono effettuate tramite corriere espresso entro 24-48h...",LOGISTICA
"Pagamenti","Accettiamo pagamenti con carta di credito, PayPal, bonifico bancario...",PAGAMENTI
```

**Regole**:
- Prima riga = header (obbligatorio)
- `title` può essere vuoto (ma la colonna deve esistere)
- `content` è obbligatorio
- `category` opzionale (default: "ALTRO")
- Usa virgolette doppie `"` per campi con virgole o newline

**Esempio con title vuoto**:
```csv
title,content,category
"","Contenuto generico senza titolo specifico...",GENERALE
"Contatti","Email: info@example.com, Tel: +39 123456789",CONTATTI
```

### JSON Format

**Array di oggetti**:
```json
[
  {
    "title": "Chi siamo",
    "content": "Azienda fondata nel 2020...",
    "category": "INFO"
  },
  {
    "title": "Prodotti",
    "content": "Offriamo una gamma completa di...",
    "category": "PRODOTTI"
  },
  {
    "content": "Informazione generica senza titolo",
    "category": "ALTRO"
  }
]
```

**Singolo oggetto** (viene convertito in array automaticamente):
```json
{
  "title": "Termini e Condizioni",
  "content": "Lorem ipsum dolor sit amet...",
  "category": "LEGALE"
}
```

---

## 🔄 Mapping Campi (Backward Compatibility)

Il sistema accetta sia la vecchia nomenclatura FAQ che la nuova:

| Vecchio Nome | Nuovo Nome | Note |
|--------------|------------|------|
| `question` | `title` | Opzionale, entrambi accettati |
| `answer` | `content` | Obbligatorio, entrambi accettati |
| `category` | `category` | Opzionale, default "ALTRO" |

**Esempio mixing vecchio/nuovo**:
```json
{
  "question": "Orari di apertura",  // ← vecchio nome
  "content": "Lun-Ven 9-18, Sab 9-13",  // ← nuovo nome
  "category": "INFO"
}
```
✅ Funziona! Il backend converte automaticamente.

---

## 📊 Esempi Completi

### CSV - Informazioni Azienda
```csv
title,content,category
"Chi siamo","Siamo un'azienda italiana fondata nel 2020. Ci occupiamo di vendita online di prodotti per la casa. Il nostro team è composto da 15 professionisti dedicati.",INFO
"Storia","La nostra storia inizia nel 2020 quando tre amici decidono di creare un e-commerce innovativo. Oggi serviamo oltre 10.000 clienti.",INFO
"Valori","Qualità, trasparenza e customer service sono al centro della nostra missione aziendale.",INFO
"","Il nostro magazzino si trova a Milano e gestiamo spedizioni in tutta Italia tramite corrieri certificati.",LOGISTICA
```

### JSON - Knowledge Base Completa
```json
[
  {
    "title": "Politica Resi",
    "content": "Offriamo resi gratuiti entro 30 giorni dall'acquisto. Il prodotto deve essere integro e nella confezione originale. Per avviare un reso, contatta il servizio clienti via email o telefono.",
    "category": "ASSISTENZA"
  },
  {
    "title": "Spedizioni",
    "content": "Spediamo in tutta Italia tramite corriere espresso. Tempi di consegna: 24-48h per ordini effettuati entro le 14:00. Spedizione gratuita per ordini superiori a 50€.",
    "category": "LOGISTICA"
  },
  {
    "content": "Accettiamo pagamenti con carta di credito (Visa, Mastercard), PayPal, bonifico bancario e contrassegno. Tutti i pagamenti sono sicuri e protetti con crittografia SSL.",
    "category": "PAGAMENTI"
  },
  {
    "title": "Garanzia Prodotti",
    "content": "Tutti i nostri prodotti sono coperti da garanzia legale di 24 mesi. Per prodotti elettronici, offriamo estensione garanzia fino a 5 anni acquistabile al checkout.",
    "category": "GARANZIE"
  }
]
```

---

## 🎯 Best Practices

### 1. Titoli Descrittivi
- ✅ Buono: "Orari Servizio Clienti"
- ❌ Evita: "Info"

### 2. Contenuto Completo
- Scrivi risposte complete e dettagliate
- Include tutte le informazioni pertinenti
- Usa formato leggibile (elenchi puntati, paragrafi brevi)

### 3. Categorie Consistenti
Usa categorie standardizzate:
- `INFO` - Informazioni aziendali
- `PRODOTTI` - Descrizioni prodotti/servizi
- `ORDINI` - Gestione ordini
- `SPEDIZIONI` / `LOGISTICA` - Spedizioni e consegne
- `PAGAMENTI` - Metodi di pagamento
- `ASSISTENZA` - Supporto clienti
- `RESI` - Politiche di reso
- `GARANZIE` - Garanzie prodotti
- `CONTATTI` - Informazioni contatto
- `ALTRO` - Altro (default)

### 4. Evita Duplicati
- Prima di importare, verifica se esistono già documenti simili
- Usa titoli univoci quando possibile

### 5. Semantic Search Friendly
Il sistema usa **semantic search** con embeddings:
- Scrivi in linguaggio naturale
- Non serve ripetere parole chiave
- L'AI capisce sinonimi e riformulazioni

**Esempio**:
```
User: "quando siete aperti?"
AI trova: "Orari di apertura: Lun-Ven 9-18"
✅ Match semantico anche senza parole esatte!
```

---

## 🚀 Come Usare il Bulk Import

### 1. Prepara il File
- Crea CSV o JSON seguendo i formati sopra
- Salva con encoding UTF-8

### 2. Importa dalla Dashboard
1. Vai su **Knowledge Base**
2. Click **"Importa CSV/JSON"**
3. Seleziona il file
4. Preview dei documenti
5. Conferma importazione

### 3. Verifica Risultati
- Gli embeddings vengono generati automaticamente
- Controlla la lista per confermare l'importazione
- Testa la ricerca semantica

---

## ⚙️ Technical Details

### Embeddings
- Model: `text-embedding-3-small` (OpenAI)
- Dimensioni: 1536
- Generazione: automatica su create/update/bulk-import
- Storage: PostgreSQL con pgvector

### Semantic Search
- Algoritmo: Cosine similarity
- Threshold: 0.7 (70%)
- Max results: 5 documenti più rilevanti
- Fallback: ritorna tutti i documenti se pgvector non disponibile

---

**Last Updated**: 26 Ottobre 2025
