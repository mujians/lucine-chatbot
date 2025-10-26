# Render.com - Deployment Configuration

**Last Updated**: 26 Ottobre 2025

---

## 🚀 Servizi Render

### 1. lucine-chatbot-db
- **Tipo**: PostgreSQL 17
- **Regione**: Frankfurt
- **Status**: Available
- **Creato**: 17 giorni fa

**Environment Variable fornita**:
```
DATABASE_URL=postgresql://...
```

---

### 2. chatbot-lucy-2025 (BACKEND)
- **Tipo**: Web Service (Node.js)
- **Regione**: Frankfurt
- **Repository**: https://github.com/mujians/lucine-chatbot

**Configurazione CORRETTA**:
```yaml
Root Directory: backend
Build Command: npm install && npx prisma generate
Start Command: npx prisma migrate deploy && node src/server.js
Environment: Node
Instance Type: Free
```

**Environment Variables RICHIESTE**:
- `DATABASE_URL` (fornito da lucine-chatbot-db)
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `PORT` (auto-assegnato da Render)
- Altre env vars specifiche dell'app

**IMPORTANTE**:
- Le migration Prisma si eseguono al **START**, non al BUILD
- DATABASE_URL è disponibile solo a runtime, non durante build
- La migration pgvector si applica automaticamente al primo deploy dopo il fix

---

### 3. lucine-dashboard (FRONTEND)
- **Tipo**: Static Site
- **Repository**: https://github.com/mujians/lucine-chatbot

**Configurazione CORRETTA**:
```yaml
Root Directory: (vuoto o frontend-dashboard)
Build Command: npm install && npm run build
Publish Directory: dist
Environment: Static
```

**Environment Variables**:
- `VITE_API_URL` = URL del backend (https://chatbot-lucy-2025.onrender.com)
- Altre VITE_* vars se necessarie

---

## 🔧 Deploy Workflow

### Deploy Backend (chatbot-lucy-2025)

1. Push codice su GitHub main branch
2. Render auto-deploya (se auto-deploy abilitato)
3. Build process:
   ```bash
   npm install
   npx prisma generate
   ```
4. Start process:
   ```bash
   npx prisma migrate deploy  # Applica migration pgvector
   node src/server.js          # Avvia server
   ```
5. Server live su porta 10000

**Logs da verificare**:
```
✅ Prisma schema loaded from prisma/schema.prisma
✅ Generated Prisma Client
✅ Applying migration `20251026_enable_pgvector`
✅ Migration applied successfully
✅ Server started on port 10000
```

### Deploy Frontend (lucine-dashboard)

1. Push codice su GitHub main branch
2. Render auto-deploya
3. Build process:
   ```bash
   npm install
   npm run build  # Crea dist/ folder
   ```
4. Publish `dist/` folder come static site

---

## 🐛 Troubleshooting

### Errore: "Could not find Prisma Schema"
**Causa**: Root Directory non impostato su `backend`
**Fix**: Settings → Root Directory = `backend`

### Errore: "Environment variable not found: DATABASE_URL"
**Causa**: Migration eseguita durante BUILD invece di START
**Fix**:
- Build Command = `npm install && npx prisma generate` (NO migrate deploy)
- Start Command = `npx prisma migrate deploy && node src/server.js`

### Errore: "Publish directory dist does not exist"
**Causa**: Build Command sbagliato su Static Site
**Fix**: Build Command = `npm install && npm run build`

### Errore: "extension vector does not exist"
**Causa**: pgvector non abilitato su PostgreSQL
**Fix**:
1. Opzione A (automatico): Migration pgvector si applica con `prisma migrate deploy`
2. Opzione B (manuale): PostgreSQL Shell → `CREATE EXTENSION vector;`

### Semantic search fallback attivo
**Logs**: `Falling back to returning all active knowledge items`
**Causa**: pgvector non disponibile
**Fix**: Verifica migration applicata con successo

---

## 📊 Verifiche Post-Deploy

### 1. Backend Health Check
```bash
curl https://chatbot-lucy-2025.onrender.com/health
# Expected: 200 OK
```

### 2. Database pgvector Extension
PostgreSQL Shell su Render:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
-- Expected: 1 row
```

### 3. Semantic Search Verification
Logs backend dopo primo messaggio utente:
```
Semantic search: found X/Y relevant results (>=0.7 similarity)
```

### 4. Frontend Live
```
https://lucine-dashboard.onrender.com
# Should load React app
```

---

## 🔄 Manual Deploy Process

### Quando fare Manual Deploy:

1. **Dopo cambio configurazione** (Root Directory, Build/Start Command)
2. **Dopo aggiunta ENV vars**
3. **Per forzare re-deploy** senza push GitHub

### Come fare:

1. Render Dashboard → Seleziona servizio
2. Click **"Manual Deploy"** button (top right)
3. Seleziona branch (main)
4. Click **"Deploy"**
5. Monitora logs per errori

---

## 📝 Environment Variables Reference

### Backend (chatbot-lucy-2025)

| Variable | Esempio | Descrizione |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | Auto da lucine-chatbot-db |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key |
| `JWT_SECRET` | `random-secret-string` | JWT signing secret |
| `PORT` | `10000` | Auto da Render |
| `NODE_ENV` | `production` | Environment |

### Frontend (lucine-dashboard)

| Variable | Esempio | Descrizione |
|----------|---------|-------------|
| `VITE_API_URL` | `https://chatbot-lucy-2025.onrender.com` | Backend URL |

---

## 🚨 IMPORTANTE - Non chiedere più!

**Struttura progetto**:
```
lucine-production/
├── backend/               # Backend Node.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       └── 20251026_enable_pgvector/
│   └── src/
│       └── server.js
├── frontend-dashboard/    # Frontend React
│   └── dist/             # Build output
└── docs/
    └── RENDER_DEPLOYMENT.md  # QUESTO FILE
```

**Servizi Render**:
1. **chatbot-lucy-2025** = BACKEND (Node.js, root=backend)
2. **lucine-dashboard** = FRONTEND (Static, root=/)
3. **lucine-chatbot-db** = DATABASE (PostgreSQL)

**Build vs Start**:
- BUILD = No DATABASE_URL disponibile
- START = DATABASE_URL disponibile → Qui vanno le migration

---

**Se qualcosa cambia, AGGIORNA QUESTO FILE!**
