# Global Chat Implementation Guide

## Overview
This guide outlines the implementation of a real-time global chat feature for the Aurelius Colosseum game, allowing players to interact, share victories, and build community engagement.

## Technology Stack

### Core Technologies
- **Socket.IO** - Real-time bidirectional communication
- **Redis** - Message caching and pub/sub for scaling
- **Express.js** - Backend integration with existing API
- **React** - Frontend chat components

### Architecture Overview
```
┌─────────────┐     WebSocket      ┌─────────────┐     Redis Pub/Sub    ┌─────────────┐
│   Frontend  │ ←────────────────→ │   Backend   │ ←──────────────────→ │    Redis    │
│  (React +   │                     │ (Express +  │                      │   (Cache)   │
│  Socket.IO) │                     │  Socket.IO) │                      └─────────────┘
└─────────────┘                     └─────────────┘
```

## Backend Implementation

### 1. Install Dependencies
```bash
npm install socket.io redis socket.io-redis
```

### 2. Socket.IO Server Setup
```javascript
// backend/src/chat/chatServer.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export async function initializeChatServer(httpServer: any) {
  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Redis adapter for horizontal scaling
  const pubClient = createClient({ url: 'redis://localhost:6379' });
  const subClient = pubClient.duplicate();
  
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));

  // Connection handling
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Authenticate wallet
    socket.on('authenticate', async ({ walletAddress, signature }) => {
      const isValid = await verifyWalletSignature(walletAddress, signature);
      if (!isValid) {
        socket.disconnect();
        return;
      }

      socket.data.walletAddress = walletAddress;
      socket.join('global-chat');
      
      // Send recent messages
      const recentMessages = await getRecentMessages();
      socket.emit('message-history', recentMessages);
    });

    // Handle chat messages
    socket.on('send-message', async (data) => {
      if (!socket.data.walletAddress) return;

      const message = {
        id: generateMessageId(),
        walletAddress: socket.data.walletAddress,
        content: sanitizeMessage(data.content),
        timestamp: Date.now(),
        type: 'user'
      };

      // Validate message
      if (!validateMessage(message)) return;

      // Store in Redis
      await storeMessage(message);

      // Broadcast to all connected clients
      io.to('global-chat').emit('new-message', message);
    });

    // Handle game events
    socket.on('game-event', async (event) => {
      if (event.type === 'vault-cracked') {
        const announcement = {
          id: generateMessageId(),
          walletAddress: event.walletAddress,
          content: `🏆 ${shortenAddress(event.walletAddress)} cracked the vault and won ${event.amount} SOL!`,
          timestamp: Date.now(),
          type: 'system',
          highlight: true
        };
        
        io.to('global-chat').emit('new-message', announcement);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}
```

### 3. Message Storage & Retrieval
```javascript
// backend/src/chat/messageStore.ts
import { Redis } from 'ioredis';

const redis = new Redis();
const MESSAGE_TTL = 86400; // 24 hours
const MAX_MESSAGES = 100;

export async function storeMessage(message: ChatMessage) {
  // Add to sorted set (score = timestamp)
  await redis.zadd('chat:messages', message.timestamp, JSON.stringify(message));
  
  // Trim to keep only recent messages
  await redis.zremrangebyrank('chat:messages', 0, -MAX_MESSAGES - 1);
  
  // Set expiry
  await redis.expire('chat:messages', MESSAGE_TTL);
}

export async function getRecentMessages(limit = 50): Promise<ChatMessage[]> {
  const messages = await redis.zrevrange('chat:messages', 0, limit - 1);
  return messages.map(msg => JSON.parse(msg));
}
```

### 4. Security & Validation
```javascript
// backend/src/chat/security.ts
import Filter from 'bad-words';
import { PublicKey } from '@solana/web3.js';

const filter = new Filter();

export function sanitizeMessage(content: string): string {
  // Remove excessive whitespace
  content = content.trim().replace(/\s+/g, ' ');
  
  // Filter profanity
  content = filter.clean(content);
  
  // Limit length
  return content.substring(0, 500);
}

export function validateMessage(message: ChatMessage): boolean {
  // Check rate limiting (1 message per 3 seconds)
  const rateLimitKey = `rate:${message.walletAddress}`;
  // Implementation depends on your rate limiting strategy
  
  // Validate content
  if (!message.content || message.content.length < 1) return false;
  
  // Check for spam patterns
  if (isSpam(message.content)) return false;
  
  return true;
}

export async function verifyWalletSignature(
  walletAddress: string, 
  signature: string
): Promise<boolean> {
  // Verify the signature matches the wallet
  // This ensures users can only chat with their own wallet
  try {
    const publicKey = new PublicKey(walletAddress);
    // Implement signature verification
    return true;
  } catch {
    return false;
  }
}
```

## Frontend Implementation

### 1. Socket.IO Client Setup
```javascript
// frontend/src/services/chatService.ts
import { io, Socket } from 'socket.io-client';
import { WalletContextState } from '@solana/wallet-adapter-react';

class ChatService {
  private socket: Socket | null = null;
  private messageHandlers: Set<(msg: ChatMessage) => void> = new Set();

  async connect(wallet: WalletContextState) {
    if (!wallet.publicKey || !wallet.signMessage) return;

    // Create signature for authentication
    const message = `Authenticate for Aurelius Chat: ${Date.now()}`;
    const signature = await wallet.signMessage(Buffer.from(message));

    this.socket = io(process.env.REACT_APP_BACKEND_URL, {
      transports: ['websocket'],
      auth: {
        walletAddress: wallet.publicKey.toString(),
        signature: Buffer.from(signature).toString('base64')
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('new-message', (message: ChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('message-history', (messages: ChatMessage[]) => {
      messages.forEach(msg => {
        this.messageHandlers.forEach(handler => handler(msg));
      });
    });
  }

  sendMessage(content: string) {
    if (!this.socket) return;
    this.socket.emit('send-message', { content });
  }

  onMessage(handler: (msg: ChatMessage) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const chatService = new ChatService();
```

### 2. React Chat Component
```javascript
// frontend/src/components/GlobalChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { chatService } from '../services/chatService';

export const GlobalChat: React.FC = () => {
  const wallet = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      chatService.connect(wallet).then(() => {
        setIsConnected(true);
      });

      const unsubscribe = chatService.onMessage((message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        unsubscribe();
        chatService.disconnect();
        setIsConnected(false);
      };
    }
  }, [wallet.connected, wallet.publicKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && isConnected) {
      chatService.sendMessage(inputValue);
      setInputValue('');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="global-chat">
      <div className="chat-header">
        <h3>⚔️ Colosseum Chat</h3>
        <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢' : '🔴'}
        </span>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.type} ${msg.highlight ? 'highlight' : ''}`}
          >
            {msg.type === 'user' && (
              <span className="author">{formatAddress(msg.walletAddress)}:</span>
            )}
            <span className="content">{msg.content}</span>
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isConnected ? "Type your message..." : "Connect wallet to chat"}
          disabled={!isConnected}
          maxLength={500}
        />
        <button type="submit" disabled={!isConnected || !inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};
```

### 3. CSS Styling
```css
/* frontend/src/styles/chat.css */
.global-chat {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 350px;
  height: 500px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #FFD700;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  font-family: 'MedievalSharp', serif;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: linear-gradient(to right, #8B0000, #DC143C);
  border-bottom: 1px solid #FFD700;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  scrollbar-width: thin;
  scrollbar-color: #FFD700 #1a1a1a;
}

.message {
  margin-bottom: 8px;
  padding: 5px 10px;
  border-radius: 4px;
  word-wrap: break-word;
}

.message.user {
  background: rgba(255, 255, 255, 0.05);
}

.message.system {
  background: rgba(255, 215, 0, 0.1);
  color: #FFD700;
  text-align: center;
  font-style: italic;
}

.message.highlight {
  animation: glow 2s ease-in-out;
  border: 1px solid #FFD700;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px #FFD700; }
  50% { box-shadow: 0 0 20px #FFD700; }
}

.author {
  color: #00CED1;
  font-weight: bold;
  margin-right: 5px;
}

.timestamp {
  color: #666;
  font-size: 0.8em;
  float: right;
}

.input-container {
  display: flex;
  padding: 10px;
  border-top: 1px solid #FFD700;
}

.input-container input {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #FFD700;
  color: white;
  border-radius: 4px 0 0 4px;
}

.input-container button {
  padding: 8px 20px;
  background: linear-gradient(to right, #8B0000, #DC143C);
  border: 1px solid #FFD700;
  color: #FFD700;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  transition: all 0.3s;
}

.input-container button:hover:not(:disabled) {
  background: linear-gradient(to right, #DC143C, #8B0000);
}

.input-container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Integration with Game Events

### Combat Victory Announcement
```javascript
// In your combat resolution handler
if (combatResult.victory && combatResult.vaultCracked) {
  socket.emit('game-event', {
    type: 'vault-cracked',
    walletAddress: playerWallet,
    amount: prizeAmount / LAMPORTS_PER_SOL,
    monsterDefeated: monster.name
  });
}
```

### Player Milestones
```javascript
// Announce special achievements
const milestones = {
  firstVictory: "achieved their first victory!",
  tenthVictory: "has won 10 battles!",
  highRoller: "entered with a massive pot!",
  dragonSlayer: "defeated the Ancient Titan!"
};
```

## Scaling Considerations

### 1. Multiple Backend Servers
- Use Redis Pub/Sub adapter for Socket.IO
- Sticky sessions with load balancer
- Shared Redis instance for message storage

### 2. Message Persistence
- Store important messages in PostgreSQL
- Use Redis for recent/active messages
- Implement message archiving

### 3. Performance Optimization
- Implement message pagination
- Use debouncing for typing indicators
- Compress messages over WebSocket

## Security Best Practices

1. **Authentication**
   - Require wallet signature for connection
   - Validate wallet ownership
   - Session timeout after inactivity

2. **Rate Limiting**
   - Max 1 message per 3 seconds per wallet
   - Daily message limits
   - Cooldown after spam detection

3. **Content Moderation**
   - Profanity filter
   - Link blocking
   - Automated spam detection
   - Community reporting system

4. **Data Protection**
   - Don't store sensitive data
   - Sanitize all user input
   - Use HTTPS/WSS only

## Deployment Checklist

- [ ] Set up Redis instance
- [ ] Configure CORS for production
- [ ] Enable WSS (WebSocket Secure)
- [ ] Set up monitoring (Socket.IO Admin UI)
- [ ] Configure auto-scaling
- [ ] Test with multiple concurrent users
- [ ] Implement reconnection logic
- [ ] Add chat toggle/minimize feature
- [ ] Mobile responsive design
- [ ] Accessibility features

## Future Enhancements

1. **Private Messages** - Direct messaging between players
2. **Chat Rooms** - Separate channels for different topics
3. **Emotes/Reactions** - Quick gladiator-themed reactions
4. **Voice Chat** - WebRTC integration for voice
5. **Translation** - Auto-translate messages
6. **NFT Badges** - Display achievements in chat
7. **Betting Chat** - Live betting on ongoing matches
8. **Tournament Chat** - Special rooms for tournaments