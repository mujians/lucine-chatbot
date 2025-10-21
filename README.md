# Lucine Chatbot - Dashboard

Dashboard operatori per il sistema Lucine Chatbot.

## Stack Tecnologico

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icons (NO EMOJI)

## Struttura

```
src/
├── components/
│   ├── dashboard/    # Componenti dashboard principale
│   └── ui/          # Componenti UI riutilizzabili
├── contexts/        # React contexts (Auth, ecc.)
├── pages/           # Pagine (Login, Index)
├── types/           # TypeScript types
└── lib/             # Utilities
```

## Setup Locale

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Deploy automatico su Render tramite `render.yaml`

## Variabili Ambiente

```env
VITE_API_URL=<URL del backend>
```

## Backend

Il backend è su repository separato: [chatbot-lucy-2025](https://github.com/mujians/chatbot-lucy-2025)

## Note

- Design ispirato a operator-vue
- Solo icone Lucide React, NO emoji
- Autenticazione JWT con AuthContext
