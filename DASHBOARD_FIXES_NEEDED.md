# Dashboard Fixes Necessari

## P3: ChatList.jsx - Aggiungi Socket.IO Listeners

**File**: `/Users/brnobtt/Desktop/lucine-production/frontend-dashboard/src/components/ChatList.jsx`

### Fix Required:
Aggiungere all'interno del `useEffect` principale:

```javascript
import { io } from 'socket.io-client';
import axios from '../lib/axios';

// ... dentro il componente

useEffect(() => {
  fetchChats();

  // Initialize Socket.IO for real-time updates
  const WS_URL = import.meta.env.VITE_WS_URL || 'https://chatbot-lucy-2025.onrender.com';
  const socket = io(WS_URL);

  // Join dashboard room
  socket.emit('join_dashboard');

  // Listen for new chat created
  socket.on('new_chat_created', (data) => {
    console.log('🆕 New chat created:', data);
    fetchChats();
  });

  // Listen for new chat requests
  socket.on('new_chat_request', (data) => {
    console.log('🔔 New chat request:', data);
    fetchChats();
  });

  // Listen for chat assigned
  socket.on('chat_assigned', (data) => {
    console.log('👤 Chat assigned:', data);
    fetchChats();
  });

  // Listen for chat closed
  socket.on('chat_closed', (data) => {
    console.log('✅ Chat closed:', data);
    fetchChats();
  });

  const interval = setInterval(fetchChats, 30000); // Poll every 30s as fallback

  return () => {
    clearInterval(interval);
    socket.emit('leave_dashboard');
    socket.disconnect();
  };
}, []);
```

## P8: ChatList.jsx - Fix undefined token

**Current Line (~26)**:
```javascript
headers: { Authorization: `Bearer ${token}` }
```

**Fix to**:
```javascript
headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
```

**OR BETTER** - Use axios instance that already has interceptor:
```javascript
// Just use axios.get() - token is added automatically by interceptor
const response = await axios.get('/api/chat/sessions', {
  params: { status, operatorId }
});
```

## P9: ChatWindow.jsx - Fix undefined token

**Multiple locations** - Replace all:
```javascript
headers: { Authorization: `Bearer ${token}` }
```

With:
```javascript
headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
```

**OR BETTER** - Use axios instance throughout.

## P10: ChatWindow.jsx - Fix operator_join emit

**Current (~Line 41)**:
```javascript
newSocket.emit('operator_join', { sessionId: chat.id });
```

**Fix to**:
```javascript
const operatorId = localStorage.getItem('operator_id');
if (operatorId) {
  newSocket.emit('operator_join', { operatorId: operatorId });
}
```

**ALSO ADD**: When ChatWindow opens, join chat room:
```javascript
newSocket.emit('join_chat', { sessionId: chat.id });
```

---

## Summary of Changes Needed:

1. ✅ axios.js created (DONE)
2. ⚠️ ChatList.jsx - Add Socket.IO listeners
3. ⚠️ ChatList.jsx - Fix token usage
4. ⚠️ ChatWindow.jsx - Fix token usage
5. ⚠️ ChatWindow.jsx - Fix operator_join emit
6. ⚠️ ChatWindow.jsx - Add join_chat emit

**Note**: The user needs to manually apply these fixes to the Dashboard as the files are too large to edit automatically. Alternatively, I can read specific sections and apply the fixes if needed.
