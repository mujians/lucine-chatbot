# LUCINE CHATBOT - ROADMAP SVILUPPO

**Data Inizio:** 2025-10-21
**Ultima Modifica:** 2025-10-21
**Versione Corrente:** 1.0.0-beta
**Target Release:** 1.0.0 (Produzione)

---

## OBIETTIVO FINALE

Creare una dashboard operatori funzionante che:
1. **Segue esattamente il design di operator-vue** (layout TopBar + Sidebar + Panels)
2. **Usa Shadcn UI** per tutti i componenti
3. **NO EMOJI** - solo lucide-react icons
4. **Connessa al backend deployato** con dati reali (no mock)
5. **Real-time con WebSocket** per notifiche live
6. **TypeScript** per type safety

---

## FASI SVILUPPO

### ✅ FASE 0: BACKEND (COMPLETATA)

**Status:** ✅ Deployato e Funzionante
**Data Completamento:** 2025-10-20

**Deliverables:**
- [✅] Backend Express + Socket.io
- [✅] Database PostgreSQL con pgvector
- [✅] Prisma ORM con migrations
- [✅] API completa (Auth, Chat, Ticket, Knowledge, Operator, Settings)
- [✅] WebSocket handlers
- [✅] Background jobs (timeout monitoring)
- [✅] Integrazione OpenAI (GPT-4 + Embeddings)
- [✅] Integrazione Twilio (WhatsApp)
- [✅] Integrazione Email (Nodemailer)
- [✅] Deploy su Render
- [✅] Admin user creato (admin@lucine.it / admin123)

**URL:** https://chatbot-lucy-2025.onrender.com
**Health:** https://chatbot-lucy-2025.onrender.com/health

**Repository:** https://github.com/mujians/chatbot-lucy-2025

---

### 🔄 FASE 1: DASHBOARD SETUP (IN CORSO)

**Status:** 🔄 In Sviluppo
**Data Inizio:** 2025-10-21
**Durata Stimata:** 1 giorno

#### Task 1.1: Creazione Progetto ⏳
- [ ] Creare nuovo progetto Vite + React + TypeScript
- [ ] Configurare Tailwind CSS
- [ ] Installare Shadcn UI CLI
- [ ] Configurare alias @/ per imports
- [ ] Setup ESLint + Prettier

**Comandi:**
```bash
cd /Users/brnobtt/Desktop/lucine-dashboard-clean
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
```

#### Task 1.2: Installazione Dipendenze ⏳
- [ ] Shadcn components (avatar, badge, button, input, scroll-area, select, separator, toast, dropdown-menu)
- [ ] react-router-dom
- [ ] socket.io-client
- [ ] axios
- [ ] lucide-react
- [ ] next-themes
- [ ] sonner
- [ ] date-fns

**Comandi:**
```bash
npx shadcn@latest add avatar badge button input scroll-area select separator toast dropdown-menu
npm install react-router-dom socket.io-client axios lucide-react next-themes sonner date-fns
```

#### Task 1.3: Configurazione Tailwind ⏳
- [ ] Setup HSL color system
- [ ] Definire variabili CSS (primary, sidebar, success, warning, etc.)
- [ ] Configurare dark mode
- [ ] Test theme switching

**File:** `src/index.css`
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --primary: 217 91% 60%;
    --primary-foreground: 210 40% 98%;
    --sidebar: 220 14% 96%;
    --sidebar-foreground: 220 9% 46%;
    --sidebar-border: 220 13% 91%;
    --border: 220 13% 91%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --success: 142 71% 45%;
    --warning: 38 92% 50%;
    --destructive: 0 84% 60%;
  }
}
```

#### Task 1.4: Struttura Folders ⏳
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   └── ...
│   │   └── dashboard/       # Dashboard components
│   │       ├── TopBar.tsx
│   │       ├── OperatorSidebar.tsx
│   │       ├── ChatListPanel.tsx
│   │       └── ChatWindow.tsx
│   ├── pages/
│   │   ├── Index.tsx        # Main dashboard (chat view)
│   │   ├── Tickets.tsx
│   │   ├── Knowledge.tsx
│   │   ├── Operators.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── WebSocketContext.tsx
│   │   └── ChatContext.tsx
│   ├── lib/
│   │   ├── api.ts           # Axios instance + API methods
│   │   └── utils.ts         # Utility functions
│   ├── types/
│   │   ├── chat.ts
│   │   ├── ticket.ts
│   │   ├── operator.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```

**Deliverables Fase 1:**
- ✅ Progetto TypeScript + Vite configurato
- ✅ Shadcn UI installato con componenti base
- ✅ Tailwind con HSL colors configurato
- ✅ Struttura folders organizzata
- ✅ Dependencies installate

---

### 🔄 FASE 2: LAYOUT & ROUTING

**Status:** ⏳ Da Iniziare
**Durata Stimata:** 0.5 giorni

#### Task 2.1: React Router Setup
- [ ] Configurare react-router-dom
- [ ] Definire routes (/, /tickets, /knowledge, /operators, /settings, /login)
- [ ] Implementare ProtectedRoute component
- [ ] Redirect login se non autenticato

**File:** `src/App.tsx`
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Login from './pages/Login';
import Index from './pages/Index';
import Tickets from './pages/Tickets';
// ...

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
            {/* ... */}
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}
```

#### Task 2.2: Layout Base (operator-vue style)
- [ ] Creare `src/pages/Index.tsx` con layout fisso
- [ ] TopBar (h-16)
- [ ] Flex container per Sidebar + Panels
- [ ] Test responsive (nascondere sidebar su mobile)

**File:** `src/pages/Index.tsx`
```tsx
import { TopBar } from '@/components/dashboard/TopBar';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';
import { ChatListPanel } from '@/components/dashboard/ChatListPanel';
import { ChatWindow } from '@/components/dashboard/ChatWindow';

export default function Index() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <OperatorSidebar />
        <ChatListPanel />
        <ChatWindow />
      </div>
    </div>
  );
}
```

**Deliverables Fase 2:**
- ✅ Routing configurato
- ✅ Layout base operator-vue style
- ✅ Protected routes con auth check

---

### 🔄 FASE 3: AUTHENTICATION

**Status:** ⏳ Da Iniziare
**Durata Stimata:** 0.5 giorni

#### Task 3.1: AuthContext
- [ ] Creare AuthContext con login/logout
- [ ] Store JWT in localStorage
- [ ] Fetch operator profile dopo login
- [ ] Auto-login se token valido in localStorage
- [ ] Axios interceptor per Authorization header

**File:** `src/contexts/AuthContext.tsx`
```tsx
interface AuthContextType {
  operator: Operator | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchOperatorProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    localStorage.setItem('auth_token', response.data.token);
    setOperator(response.data.operator);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setOperator(null);
  };

  return (
    <AuthContext.Provider value={{ operator, isAuthenticated: !!operator, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Task 3.2: Login Page
- [ ] Form login con email + password
- [ ] Validation
- [ ] Error handling
- [ ] Loading state
- [ ] Redirect dopo login

**File:** `src/pages/Login.tsx`
```tsx
export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Lucine Chatbot</CardTitle>
          <CardDescription>Login Operatori</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Deliverables Fase 3:**
- ✅ AuthContext funzionante
- ✅ Login page con validazione
- ✅ JWT storage e auto-login
- ✅ Protected routes working

---

### 🔄 FASE 4: WEBSOCKET CONTEXT

**Status:** ⏳ Da Iniziare
**Durata Stimata:** 0.5 giorni

#### Task 4.1: WebSocketContext
- [ ] Creare WebSocketContext con socket.io-client
- [ ] Connessione automatica dopo login
- [ ] Emit operator_join con operatorId
- [ ] Listeners per eventi (new_chat_request, new_ticket_created, etc.)
- [ ] Gestione notifiche toast
- [ ] Reconnection automatica

**File:** `src/contexts/WebSocketContext.tsx`
```tsx
interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { operator, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !operator) return;

    const token = localStorage.getItem('auth_token');
    const newSocket = io(WS_URL, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      newSocket.emit('operator_join', { operatorId: operator.id });
    });

    newSocket.on('new_chat_request', (data) => {
      toast.info(`Nuova chat da ${data.userName}`);
      setNotifications((prev) => [...prev, { type: 'chat', data }]);
    });

    newSocket.on('new_ticket_created', (data) => {
      toast.warning(`Nuovo ticket da ${data.userName}`);
      setNotifications((prev) => [...prev, { type: 'ticket', data }]);
    });

    // ... altri listeners

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, operator]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, notifications }}>
      {children}
    </WebSocketContext.Provider>
  );
}
```

**Deliverables Fase 4:**
- ✅ WebSocketContext funzionante
- ✅ Auto-connect dopo login
- ✅ Event listeners configurati
- ✅ Toast notifications per eventi

---

### 🔄 FASE 5: COMPONENTI DASHBOARD

**Status:** ⏳ Da Iniziare
**Durata Stimata:** 2 giorni

#### Task 5.1: TopBar Component
**Reference:** `/tmp/operator-vue/src/components/dashboard/TopBar.tsx`

- [ ] Header con logo/title
- [ ] Bell icon per notifiche (Badge con count)
- [ ] DropdownMenu per user (avatar, nome, logout)
- [ ] Popover notifiche con lista
- [ ] Click notifica → naviga a chat/ticket

**File:** `src/components/dashboard/TopBar.tsx`
```tsx
export function TopBar() {
  const { operator, logout } = useAuth();
  const { notifications } = useWebSocket();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Lucine Chatbot</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1" variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <h3 className="font-semibold mb-2">Notifiche</h3>
            {/* Lista notifiche */}
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {operator?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{operator?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

#### Task 5.2: OperatorSidebar Component
**Reference:** `/tmp/operator-vue/src/components/dashboard/OperatorSidebar.tsx`

- [ ] Width fisso w-64
- [ ] Sezione profilo operatore con Avatar
- [ ] Select per status (Online, Away, Busy, Offline)
- [ ] Navigation buttons:
  - Active Chats (default, /  )
  - Tickets (/tickets)
  - Knowledge (/knowledge)
  - Operators (/operators - admin only)
  - Settings (/settings)
- [ ] Highlight active route
- [ ] API call per cambio status

**File:** `src/components/dashboard/OperatorSidebar.tsx`
```tsx
export function OperatorSidebar() {
  const { operator } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState(operator?.status || 'OFFLINE');

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/api/operators/me`, { status: newStatus });
      setStatus(newStatus);
    } catch (error) {
      toast.error('Errore cambio status');
    }
  };

  const navItems = [
    { path: '/', label: 'Chat Attive', icon: MessageSquare },
    { path: '/tickets', label: 'Tickets', icon: Ticket },
    { path: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { path: '/operators', label: 'Operatori', icon: Users, adminOnly: true },
    { path: '/settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r flex flex-col">
      {/* Profile */}
      <div className="p-6 border-b border-sidebar-border">
        <Avatar className="h-12 w-12 mb-3">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {operator?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-sidebar-foreground">{operator?.name}</h3>
        <p className="text-sm text-muted-foreground">{operator?.email}</p>

        {/* Status Select */}
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ONLINE">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success"></span>
                Online
              </div>
            </SelectItem>
            <SelectItem value="AWAY">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-warning"></span>
                Assente
              </div>
            </SelectItem>
            <SelectItem value="BUSY">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive"></span>
                Occupato
              </div>
            </SelectItem>
            <SelectItem value="OFFLINE">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted"></span>
                Offline
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          if (item.adminOnly && operator?.role !== 'ADMIN') return null;

          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Button
              key={item.path}
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
```

#### Task 5.3: ChatListPanel Component
**Reference:** `/tmp/operator-vue/src/components/dashboard/ChatListPanel.tsx`

- [ ] Width fisso w-96
- [ ] Search input con icon
- [ ] Filter buttons (All, Waiting, Active, With Operator)
- [ ] ScrollArea per lista chat
- [ ] Fetch chat sessions da API `GET /api/chat/sessions`
- [ ] Render chat card (avatar, nome, last message, timestamp, status badge)
- [ ] Click chat → seleziona e mostra in ChatWindow
- [ ] WebSocket listener per update real-time
- [ ] Refresh automatico ogni 5s

**File:** `src/components/dashboard/ChatListPanel.tsx`
```tsx
export function ChatListPanel() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'WAITING' | 'ACTIVE' | 'WITH_OPERATOR'>('ALL');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { socket } = useWebSocket();

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_chat_request', () => fetchChats());
    socket.on('chat_assigned', () => fetchChats());
    socket.on('new_message', () => fetchChats());

    return () => {
      socket.off('new_chat_request');
      socket.off('chat_assigned');
      socket.off('new_message');
    };
  }, [socket]);

  const fetchChats = async () => {
    try {
      const response = await chatApi.getSessions();
      setChats(response.data.data?.sessions || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  useEffect(() => {
    let filtered = chats;

    if (filter !== 'ALL') {
      filtered = filtered.filter((chat) => chat.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter((chat) =>
        chat.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredChats(filtered);
  }, [chats, filter, searchTerm]);

  return (
    <div className="w-96 bg-card border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Chat Attive</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['ALL', 'WAITING', 'ACTIVE', 'WITH_OPERATOR'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f as any)}
            >
              {f === 'ALL' ? 'Tutte' : f.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setSelectedChatId(chat.id)}
            className={cn(
              'w-full p-4 text-left hover:bg-muted/50 border-b transition-colors',
              selectedChatId === chat.id && 'bg-muted'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {chat.userName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{chat.userName || 'Utente Anonimo'}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.lastMessageAt), {
                      addSuffix: true,
                      locale: it,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Message */}
            <p className="text-sm text-muted-foreground truncate mb-2">
              {chat.messages?.[chat.messages.length - 1]?.content || 'Nessun messaggio'}
            </p>

            {/* Status Badge */}
            <Badge variant={getStatusVariant(chat.status)}>
              {getStatusIcon(chat.status)}
              <span className="ml-1">{chat.status}</span>
            </Badge>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}

// Helper functions - NO EMOJI!
function getStatusIcon(status: string) {
  switch (status) {
    case 'WAITING':
      return <Clock className="h-3 w-3" />;
    case 'ACTIVE':
      return <Bot className="h-3 w-3" />;
    case 'WITH_OPERATOR':
      return <User className="h-3 w-3" />;
    case 'CLOSED':
      return <Check className="h-3 w-3" />;
    default:
      return <Circle className="h-3 w-3" />;
  }
}
```

#### Task 5.4: ChatWindow Component
**Reference:** `/tmp/operator-vue/src/components/dashboard/ChatWindow.tsx`

- [ ] Flex-1 width (occupa spazio rimanente)
- [ ] Header chat (nome user, status, actions)
- [ ] ScrollArea messaggi con auto-scroll
- [ ] Message bubbles (user vs operator vs ai)
- [ ] Input area (textarea + send button)
- [ ] WebSocket emit send_message
- [ ] WebSocket listen new_message
- [ ] Actions: Close Chat, Create Ticket, Transfer

**File:** `src/components/dashboard/ChatWindow.tsx`
```tsx
export function ChatWindow() {
  const { selectedChatId } = useChatContext();
  const { operator } = useAuth();
  const { socket } = useWebSocket();
  const [chat, setChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedChatId) return;
    fetchChatDetails();
  }, [selectedChatId]);

  useEffect(() => {
    if (!socket || !selectedChatId) return;

    socket.on('new_message', (data) => {
      if (data.sessionId === selectedChatId) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket, selectedChatId]);

  const fetchChatDetails = async () => {
    try {
      const response = await chatApi.getSession(selectedChatId);
      setChat(response.data.data);
      setMessages(response.data.data.messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId) return;

    setLoading(true);
    try {
      await chatApi.sendMessage(selectedChatId, newMessage);
      setNewMessage('');
      // Message will be added via WebSocket
    } catch (error) {
      toast.error('Errore invio messaggio');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="h-16 w-16 mx-auto mb-4" />
          <p>Seleziona una chat per iniziare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="h-16 border-b px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {chat?.userName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{chat?.userName || 'Utente Anonimo'}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Badge variant={getStatusVariant(chat?.status)}>
                {chat?.status}
              </Badge>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateTicket}>
            <Ticket className="h-4 w-4 mr-2" />
            Crea Ticket
          </Button>
          <Button variant="destructive" size="sm" onClick={handleCloseChat}>
            <X className="h-4 w-4 mr-2" />
            Chiudi Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isOperator = msg.sender === 'OPERATOR';
            const isAI = msg.sender === 'AI';

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  isOperator && 'justify-end'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg p-3',
                    isOperator && 'bg-primary text-primary-foreground',
                    isAI && 'bg-muted',
                    !isOperator && !isAI && 'bg-card border'
                  )}
                >
                  {isAI && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-4 w-4" />
                      <span className="text-xs font-semibold">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Scrivi un messaggio..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="min-h-[60px] max-h-[120px]"
          />
          <Button onClick={handleSendMessage} disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Deliverables Fase 5:**
- ✅ TopBar con notifiche e user menu
- ✅ OperatorSidebar con status e navigation
- ✅ ChatListPanel con search, filters, real-time update
- ✅ ChatWindow con messages, input, WebSocket
- ✅ NO EMOJI - solo lucide-react icons

---

### 🔄 FASE 6: ALTRE PAGINE

**Status:** ⏳ Da Iniziare
**Durata Stimata:** 1 giorno

#### Task 6.1: Tickets Page
- [ ] Table component con tickets
- [ ] Columns: ID, User, Contact, Status, Priority, Created, Actions
- [ ] Filters (status, priority, date range)
- [ ] Click row → Modal dettaglio ticket
- [ ] Form chiusura ticket con notes
- [ ] Real-time update via WebSocket

#### Task 6.2: Knowledge Page
- [ ] List/Grid documenti
- [ ] Upload form (file + metadata)
- [ ] Edit document
- [ ] Delete document
- [ ] Search documenti

#### Task 6.3: Operators Page (Admin Only)
- [ ] Table operatori
- [ ] Create operator form
- [ ] Edit operator
- [ ] View statistics
- [ ] Disable/Enable operator

#### Task 6.4: Settings Page
- [ ] Form settings con tabs
- [ ] AI Settings
- [ ] WhatsApp Settings
- [ ] Email Settings
- [ ] Chat Settings
- [ ] Widget Settings
- [ ] Save button con validation

**Deliverables Fase 6:**
- ✅ Tutte le pagine implementate
- ✅ Forms funzionanti con API
- ✅ Validation e error handling

---

### 🔄 FASE 7: TESTING & REFINEMENT

**Status:** ⏳ Da Iniziare
**Durata Stimata:** 1 giorno

#### Task 7.1: Functional Testing
- [ ] Test login/logout
- [ ] Test chat flow completo
- [ ] Test ticket creation
- [ ] Test knowledge upload
- [ ] Test settings save
- [ ] Test WebSocket real-time

#### Task 7.2: UI/UX Polish
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Animations smooth
- [ ] Responsive mobile

#### Task 7.3: Performance
- [ ] Lazy loading componenti
- [ ] Debounce search inputs
- [ ] Pagination chat list
- [ ] Optimize re-renders

**Deliverables Fase 7:**
- ✅ Dashboard completamente funzionante
- ✅ Nessun bug critico
- ✅ UX fluida

---

### 🔄 FASE 8: DEPLOY

**Status:** ⏳ Da Iniziare
**Durata Stimata:** 0.5 giorni

#### Task 8.1: Build Produzione
- [ ] `npm run build`
- [ ] Test build locale con `npm run preview`
- [ ] Verificare dimensione bundle
- [ ] Verificare env vars corrette

#### Task 8.2: Deploy Render
- [ ] Creare nuovo Static Site su Render
- [ ] Collegare repository GitHub
- [ ] Configurare build command: `npm run build`
- [ ] Configurare publish directory: `dist`
- [ ] Impostare env vars:
  - `VITE_API_URL=https://chatbot-lucy-2025.onrender.com`
  - `VITE_WS_URL=https://chatbot-lucy-2025.onrender.com`
- [ ] Deploy e test

#### Task 8.3: Post-Deploy Testing
- [ ] Test login produzione
- [ ] Test WebSocket connessione
- [ ] Test API calls
- [ ] Test su diversi browser
- [ ] Test mobile responsive

**Deliverables Fase 8:**
- ✅ Dashboard deployata su Render
- ✅ URL produzione funzionante
- ✅ Sostituisce vecchia dashboard

---

### ⏳ FASE 9: WIDGET SHOPIFY (FUTURE)

**Status:** ⏳ Da Pianificare
**Durata Stimata:** 1 giorno

#### Task 9.1: Widget Build
- [ ] Ottimizzare frontend-widget
- [ ] Build produzione minimizzato
- [ ] Test standalone

#### Task 9.2: Liquid Integration
- [ ] Creare file chatbot-popup.liquid
- [ ] Inserire in theme assets
- [ ] Configurare settings schema
- [ ] Test su tema Shopify locale

#### Task 9.3: Deploy Widget
- [ ] Upload su tema Shopify produzione
- [ ] Test su store live
- [ ] Documentare installazione

**Deliverables Fase 9:**
- ✅ Widget funzionante in Shopify
- ✅ Documentazione installazione

---

## TIMELINE PROGETTO

```
Settimana 1 (21-25 Ottobre 2025)
├── ✅ Lunedì 21: FASE 0 (Backend) - COMPLETATA
├── 🔄 Lunedì 21 pomeriggio: FASE 1 (Setup)
├── ⏳ Martedì 22: FASE 2-4 (Layout, Auth, WebSocket)
├── ⏳ Mercoledì 23: FASE 5 (Componenti Dashboard)
├── ⏳ Giovedì 24: FASE 5 (continua) + FASE 6 (Altre Pagine)
└── ⏳ Venerdì 25: FASE 7 (Testing) + FASE 8 (Deploy)

Settimana 2 (28-31 Ottobre 2025)
└── ⏳ Lunedì 28: FASE 9 (Widget Shopify)
```

**Target Go-Live:** Venerdì 25 Ottobre 2025

---

## PROSSIMI PASSI IMMEDIATI (ORA)

1. ✅ Creare cartella `/Users/brnobtt/Desktop/lucine-dashboard-clean`
2. ✅ Creare documenti TOOL_FUNCTIONS.md, ROADMAP.md, TECHNICAL_SCHEMA.md
3. ⏳ **FASE 1.1:** Setup progetto Vite + React + TypeScript
4. ⏳ **FASE 1.2:** Installare Shadcn UI + dipendenze
5. ⏳ **FASE 1.3:** Configurare Tailwind con HSL colors
6. ⏳ **FASE 1.4:** Creare struttura folders

**Comandi da eseguire:**
```bash
cd /Users/brnobtt/Desktop/lucine-dashboard-clean
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
npx shadcn@latest add avatar badge button input scroll-area select separator toast dropdown-menu
npm install react-router-dom socket.io-client axios lucide-react next-themes sonner date-fns
npm run dev
```

---

## METRICHE SUCCESS

### MVP (Minimum Viable Product)
- ✅ Login funzionante
- ✅ Layout operator-vue style
- ✅ Chat list con real-time update
- ✅ Chat window con send/receive
- ✅ Ticket list
- ✅ NO EMOJI

### v1.0 (Production Ready)
- ✅ Tutte le funzioni dashboard
- ✅ WebSocket stabile
- ✅ Settings management
- ✅ Knowledge base upload
- ✅ Operator management
- ✅ Analytics base
- ✅ Mobile responsive

### v1.1 (Future Enhancements)
- ⏳ Widget Shopify integrato
- ⏳ Advanced analytics
- ⏳ Custom reports
- ⏳ Automazioni avanzate
- ⏳ Multi-language

---

## AGGIORNARE QUESTO DOCUMENTO

**Quando aggiornare:**
- ✅ Completi una fase → Cambia status da ⏳ a ✅
- ✅ Inizi una nuova task → Aggiungi timestamp
- ✅ Cambi piano → Documenta motivo
- ✅ Aggiungi feature → Nuova sezione FASE
- ✅ Deploy nuova versione → Aggiorna URL

**Ultima modifica:** 2025-10-21 - Creazione roadmap iniziale
