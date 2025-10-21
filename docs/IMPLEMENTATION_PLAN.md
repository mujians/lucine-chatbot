# IMPLEMENTATION PLAN - Lucine Dashboard

**Data:** 21 Ottobre 2025
**Target Completamento:** v1.0 - Fine Ottobre 2025

---

## OVERVIEW

Piano di implementazione sistematico per completare la dashboard operatori mantenendo:
- Codice pulito e organizzato
- Design system consistente (operator-vue style)
- NO emoji, solo lucide-react icons
- TypeScript per tutto
- Componenti riutilizzabili

---

## AUDIT: BACKEND vs DASHBOARD

### BACKEND ENDPOINTS DISPONIBILI

| Categoria | Endpoint | Dashboard Ha UI |
|-----------|----------|----------------|
| **Auth** | POST /auth/login | YES |
| **Chat** | GET /chat/sessions | YES |
| | GET /chat/sessions/:id | YES |
| | POST /chat/sessions/:id/close | YES |
| **Tickets** | GET /tickets | NO |
| | GET /tickets/:id | NO |
| | POST /tickets/:id/assign | NO |
| | POST /tickets/:id/resolve | NO |
| **Knowledge** | GET /knowledge | NO |
| | POST /knowledge | NO |
| | PUT /knowledge/:id | NO |
| | DELETE /knowledge/:id | NO |
| **Operators** | GET /operators | NO |
| | POST /operators | NO |
| | PUT /operators/:id | NO |
| **Settings** | GET /settings | NO |
| | PUT /settings/:key | NO |

---

## STRUTTURA TARGET

```
src/
├── components/
│   ├── dashboard/          # Layout (ESISTENTI)
│   │   ├── TopBar.tsx
│   │   ├── OperatorSidebar.tsx
│   │   ├── ChatListPanel.tsx
│   │   └── ChatWindow.tsx
│   ├── tickets/            # NUOVO
│   │   ├── TicketList.tsx
│   │   ├── TicketDetail.tsx
│   │   ├── TicketFilters.tsx
│   │   └── AssignOperatorDialog.tsx
│   ├── knowledge/          # NUOVO
│   │   ├── DocumentList.tsx
│   │   ├── DocumentForm.tsx
│   │   ├── DocumentPreview.tsx
│   │   └── CategoryFilter.tsx
│   ├── operators/          # NUOVO
│   │   ├── OperatorList.tsx
│   │   ├── OperatorForm.tsx
│   │   ├── OperatorStats.tsx
│   │   └── RoleBadge.tsx
│   ├── settings/           # NUOVO
│   │   ├── SettingCard.tsx
│   │   ├── AISettings.tsx
│   │   ├── WhatsAppSettings.tsx
│   │   └── EmailSettings.tsx
│   ├── shared/             # NUOVO - Componenti riutilizzabili
│   │   ├── EmptyState.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── DataTable.tsx
│   │   ├── PageHeader.tsx
│   │   ├── SearchBar.tsx
│   │   └── ConfirmDialog.tsx
│   └── ui/                 # Shadcn (ESISTENTE)
├── pages/
│   ├── Index.tsx           # ESISTENTE - Chat
│   ├── Login.tsx           # ESISTENTE
│   ├── Tickets.tsx         # NUOVO
│   ├── Knowledge.tsx       # NUOVO
│   ├── Operators.tsx       # NUOVO - Admin only
│   ├── Settings.tsx        # NUOVO - Admin only
│   └── Profile.tsx         # NUOVO
├── hooks/                  # NUOVO - Custom hooks
│   ├── useChats.ts
│   ├── useTickets.ts
│   ├── useKnowledge.ts
│   ├── useOperators.ts
│   ├── useSettings.ts
│   └── useDebounce.ts
├── lib/
│   ├── api.ts              # NUOVO - API client centralizzato
│   └── utils.ts            # ESISTENTE
└── types/
    └── index.ts            # ESISTENTE - Espandere
```

---

## DESIGN SYSTEM

### Colori (Tailwind)
```css
--primary: #059669      /* Green - primary actions */
--danger: #dc2626       /* Red - delete, errors */
--warning: #f59e0b      /* Amber - warnings */
--muted: #6b7280        /* Gray - disabled, secondary */
--background: #1a1a1a   /* Dark background */
--foreground: #ffffff   /* White text */
```

### Icons (lucide-react)
```tsx
import { MessageSquare, Ticket, Book, Users, Settings, LogOut } from 'lucide-react'
```

### Typography
```css
h1: text-2xl font-semibold
h2: text-xl font-semibold
h3: text-lg font-medium
body: text-base
small: text-sm text-muted-foreground
```

### Spacing
```
Page padding: p-6
Section gap: space-y-6
Component gap: space-y-4
```

---

## FASE 1: SETUP COMPONENTI SHARED

**Obiettivo:** Creare componenti riutilizzabili per evitare duplicazione codice

### 1.1 EmptyState Component

```typescript
// components/shared/EmptyState.tsx
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

### 1.2 StatusBadge Component

```typescript
// components/shared/StatusBadge.tsx
type Status = 'PENDING' | 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED' | 'ACTIVE' | 'WAITING' | 'WITH_OPERATOR'

const statusConfig: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'In Attesa', variant: 'secondary' },
  OPEN: { label: 'Aperto', variant: 'default' },
  ASSIGNED: { label: 'Assegnato', variant: 'outline' },
  RESOLVED: { label: 'Risolto', variant: 'default' },
  CLOSED: { label: 'Chiuso', variant: 'secondary' },
  ACTIVE: { label: 'Attivo', variant: 'default' },
  WAITING: { label: 'In Coda', variant: 'secondary' },
  WITH_OPERATOR: { label: 'Con Operatore', variant: 'default' },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
```

### 1.3 PriorityBadge Component

```typescript
// components/shared/PriorityBadge.tsx
type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: 'Bassa', className: 'bg-gray-100 text-gray-800' },
  NORMAL: { label: 'Normale', className: 'bg-blue-100 text-blue-800' },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
  URGENT: { label: 'Urgente', className: 'bg-red-100 text-red-800' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority]
  return <Badge className={config.className}>{config.label}</Badge>
}
```

### 1.4 PageHeader Component

```typescript
// components/shared/PageHeader.tsx
interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

### 1.5 API Client Centralizzato

```typescript
// lib/api.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://chatbot-lucy-2025.onrender.com/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor per JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor per error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API methods
export const ticketsApi = {
  getAll: (params?: { status?: string; priority?: string }) =>
    api.get('/tickets', { params }),
  getById: (id: string) => api.get(`/tickets/${id}`),
  assign: (id: string, operatorId: string) =>
    api.post(`/tickets/${id}/assign`, { operatorId }),
  resolve: (id: string, notes: string) =>
    api.post(`/tickets/${id}/resolve`, { resolutionNotes: notes }),
}

export const knowledgeApi = {
  getAll: () => api.get('/knowledge'),
  getById: (id: string) => api.get(`/knowledge/${id}`),
  create: (data: any) => api.post('/knowledge', data),
  update: (id: string, data: any) => api.put(`/knowledge/${id}`, data),
  delete: (id: string) => api.delete(`/knowledge/${id}`),
  toggle: (id: string) => api.patch(`/knowledge/${id}/toggle`),
}

export const operatorsApi = {
  getAll: () => api.get('/operators'),
  getOnline: () => api.get('/operators/online'),
  create: (data: any) => api.post('/operators', data),
  update: (id: string, data: any) => api.put(`/operators/${id}`, data),
  delete: (id: string) => api.delete(`/operators/${id}`),
}

export const settingsApi = {
  getAll: () => api.get('/settings'),
  getByKey: (key: string) => api.get(`/settings/${key}`),
  update: (key: string, value: any) => api.put(`/settings/${key}`, { value }),
}
```

---

## FASE 2: TICKETS IMPLEMENTATION

**Priorità: ALTA** | **Tempo stimato: 8-10 ore**

### 2.1 Types

```typescript
// types/index.ts (aggiungere)
export interface Ticket {
  id: string
  userName: string
  contactMethod: 'WHATSAPP' | 'EMAIL'
  whatsappNumber?: string
  email?: string
  initialMessage: string
  status: 'PENDING' | 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  operatorId?: string
  operator?: {
    id: string
    name: string
  }
  assignedAt?: string
  resolutionNotes?: string
  resolvedAt?: string
  resumeToken: string
  resumeTokenExpiresAt: string
  sessionId: string
  createdAt: string
  updatedAt: string
}
```

### 2.2 Custom Hook

```typescript
// hooks/useTickets.ts
import { useState, useEffect } from 'react'
import { ticketsApi } from '@/lib/api'
import type { Ticket } from '@/types'

export function useTickets(filters?: { status?: string; priority?: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await ticketsApi.getAll(filters)
      setTickets(response.data.data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [filters])

  return { tickets, loading, error, refetch: fetchTickets }
}
```

### 2.3 Tickets Page

```typescript
// pages/Tickets.tsx
import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { TicketList } from '@/components/tickets/TicketList'
import { TicketFilters } from '@/components/tickets/TicketFilters'
import { useTickets } from '@/hooks/useTickets'

export default function Tickets() {
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const { tickets, loading, error, refetch } = useTickets(filters)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tickets"
        description="Gestisci richieste di supporto asincrone"
      />

      <TicketFilters filters={filters} onChange={setFilters} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Errore: {error}
        </div>
      )}

      <TicketList tickets={tickets} loading={loading} onUpdate={refetch} />
    </div>
  )
}
```

### 2.4 Componenti Tickets

**TicketList.tsx:** Tabella con lista ticket
**TicketDetail.tsx:** Drawer con dettaglio e conversazione
**TicketFilters.tsx:** Filtri status/priority
**AssignOperatorDialog.tsx:** Dialog per assegnazione

---

## FASE 3: KNOWLEDGE BASE

**Priorità: MEDIA** | **Tempo stimato: 6-8 ore**

### 3.1 Types

```typescript
export interface KnowledgeItem {
  id: string
  question: string
  answer: string
  category?: string
  isActive: boolean
  createdById: string
  createdBy: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}
```

### 3.2 Page Structure

- Lista documenti con search e filtri categoria
- Form crea/modifica (dialog)
- Toggle attivo/inattivo
- Delete con conferma

---

## FASE 4: SETTINGS & OPERATORS

**Priorità: MEDIA/BASSA** | **Tempo stimato: 8-10 ore**

### 4.1 Settings Page

- Config AI (model, temperature, threshold)
- Config WhatsApp (Twilio credentials)
- Config Email (SMTP)
- Config Widget (tema, colori)

### 4.2 Operators Page (Admin only)

- Lista operatori con stats
- Form crea operatore
- Modifica ruolo e permessi
- Soft delete

---

## FASE 5: PROFILE & UX

**Priorità: BASSA** | **Tempo stimato: 4-6 ore**

- Pagina profilo operatore
- Toggle disponibilità
- Preferenze notifiche
- Change password

---

## TESTING CHECKLIST

### Tickets
- [ ] Lista tickets carica correttamente
- [ ] Filtri status/priority funzionano
- [ ] Assegnazione ticket a operatore
- [ ] Chiusura ticket con note
- [ ] Notifiche real-time nuovi ticket (WebSocket)

### Knowledge
- [ ] CRUD documenti completo
- [ ] Search funziona
- [ ] Categorizzazione corretta
- [ ] Toggle attivo/inattivo

### Settings
- [ ] Save settings funziona
- [ ] Validazione input
- [ ] Error handling

---

## DEPLOYMENT CHECKLIST

- [ ] Build produzione senza errori TypeScript
- [ ] Environment variables configurate su Render
- [ ] CORS backend include tutti domini necessari
- [ ] WebSocket connessione stabile
- [ ] Test login/logout
- [ ] Test ogni feature implementata

---

## NOTES

**Principi di sviluppo:**
- SEMPRE TypeScript
- SEMPRE lucide-react icons (NO emoji)
- SEMPRE Shadcn UI components
- SEMPRE error handling
- SEMPRE loading states
- SEMPRE real data (no mock)

**Code style:**
- Componenti funzionali con hooks
- Props tipizzate con interface
- Naming consistente (PascalCase componenti, camelCase funzioni)
- File max 300 righe (split se troppo grande)
- Commenti solo se logica complessa

---

**Piano creato:** 21 Ottobre 2025
**Da aggiornare dopo ogni fase completata**
