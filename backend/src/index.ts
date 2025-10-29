import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import dotenv from 'dotenv';

import createRouter from './api/routes';
import arenaRoutes from './routes/arena-routes';
import { SolanaService } from './services/solana-service';
import { arenaService } from './services/arena-service';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize services after env vars are loaded
const solanaService = new SolanaService();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// API Routes - pass solanaService to router
app.use('/api', createRouter(solanaService));

// Arena Routes
app.use('/api/arena', arenaRoutes);

// WebSocket for real-time pot updates to frontend clients
wss.on('connection', (ws) => {
  console.log('New client WebSocket connection');

  // Send current pot immediately
  solanaService.getCurrentPot().then(pot => {
    ws.send(JSON.stringify({
      type: 'pot-update',
      currentPot: pot,
      timestamp: Date.now()
    }));
  });

  ws.on('close', () => {
    console.log('Client WebSocket connection closed');
  });
});

// Broadcast pot updates to all connected clients
function broadcastPotUpdate(currentPot: number) {
  const message = JSON.stringify({
    type: 'pot-update',
    currentPot,
    timestamp: Date.now()
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// Broadcast arena events to all connected clients
function broadcastArenaEvent(eventType: string, playerWallet: string, data: any) {
  const message = JSON.stringify({
    type: eventType,
    playerWallet,
    data,
    timestamp: Date.now()
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// Helius WebSocket for efficient on-chain monitoring
let heliusWs: WebSocket | null = null;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || 'b6f88694-3cf1-45b9-9c7e-f2fa601cd717';
const PROGRAM_ID = process.env.PROGRAM_ID!;

function connectHeliusWebSocket() {
  // Use devnet for Helius WebSocket
  const wsUrl = `wss://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  heliusWs = new WebSocket(wsUrl);

  heliusWs.on('open', () => {
    console.log('🔌 Connected to Helius WebSocket');
    
    // Subscribe to program logs (most credit-efficient for monitoring specific events)
    const subscribeMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'logsSubscribe',
      params: [
        {
          mentions: [PROGRAM_ID]
        },
        {
          commitment: 'confirmed'
        }
      ]
    };
    
    heliusWs!.send(JSON.stringify(subscribeMessage));
  });

  heliusWs.on('message', async (data) => {
    const message = JSON.parse(data.toString());
    
    // Handle subscription confirmation
    if (message.result) {
      console.log('✅ Subscribed to program logs with ID:', message.result);
      return;
    }
    
    // Handle log notifications
    if (message.method === 'logsNotification') {
      const logs = message.params.result.value.logs;
      
      // Check if a player entered (pot increased)
      if (logs.some((log: string) => log.includes('Player entered!'))) {
        console.log('📈 Player entered detected');
        // Fetch new pot amount and broadcast
        const pot = await solanaService.getCurrentPot();
        console.log(`💰 Pot updated: ${pot / LAMPORTS_PER_SOL} SOL`);
        broadcastPotUpdate(pot);
      }
      
      // Check if prize was claimed (pot reset)
      if (logs.some((log: string) => log.includes('Prize claimed:'))) {
        console.log('🏆 Prize claimed detected');
        // Small delay to ensure on-chain state is updated
        setTimeout(async () => {
          const pot = await solanaService.getCurrentPot();
          console.log(`🔄 Pot reset: ${pot / LAMPORTS_PER_SOL} SOL`);
          broadcastPotUpdate(pot);
        }, 1000);
      }
    }
  });

  heliusWs.on('error', (error) => {
    console.error('❌ Helius WebSocket error:', error);
  });

  heliusWs.on('close', () => {
    console.log('🔌 Helius WebSocket disconnected, reconnecting in 5s...');
    setTimeout(connectHeliusWebSocket, 5000);
  });
}

// Setup Arena Service event handlers to relay to WebSocket clients
arenaService.onArenaCountdownStarted = (playerWallet, data) => {
  console.log(`[Arena] Countdown started for ${playerWallet}`);
  broadcastArenaEvent('arena-countdown-started', playerWallet, data);
};

arenaService.onCountdownUpdate = (playerWallet, data) => {
  broadcastArenaEvent('arena-countdown-update', playerWallet, data);
};

arenaService.onArenaBegins = (playerWallet, data) => {
  console.log(`[Arena] Arena begins for ${playerWallet}`);
  broadcastArenaEvent('arena-begins', playerWallet, data);
};

arenaService.onImmediateItemDrop = (playerWallet, data) => {
  console.log(`[Arena] Item dropped for ${playerWallet}:`, data);
  broadcastArenaEvent('arena-item-drop', playerWallet, data);
};

arenaService.onPlayerBoostActivated = (playerWallet, data) => {
  console.log(`[Arena] Player boosted for ${playerWallet}:`, data);
  broadcastArenaEvent('arena-player-boost', playerWallet, data);
};

arenaService.onPackageDrop = (playerWallet, data) => {
  console.log(`[Arena] Package drop for ${playerWallet}:`, data);
  broadcastArenaEvent('arena-package-drop', playerWallet, data);
};

arenaService.onGameCompleted = (playerWallet, data) => {
  console.log(`[Arena] Game completed for ${playerWallet}`);
  broadcastArenaEvent('arena-game-completed', playerWallet, data);
};

arenaService.onGameStopped = (playerWallet, data) => {
  console.log(`[Arena] Game stopped for ${playerWallet}`);
  broadcastArenaEvent('arena-game-stopped', playerWallet, data);
};

arenaService.onPackageBroadcast = (data) => {
  console.log(`[Arena] Broadcasting package to all clients:`, data);
  broadcastArenaEvent('arena-item-drop', data.playerWallet, data);
};

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for client connections`);
  
  // Check backend wallet balance
  const balance = await solanaService.ensureBackendBalance();
  console.log(`💰 Backend wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  // Log current game state
  const gameState = await solanaService.getGameState();
  console.log(`🎮 Current pot: ${gameState.currentPot / LAMPORTS_PER_SOL} SOL`);
  console.log(`📊 Total entries: ${gameState.totalEntries}`);
  
  // Connect to Helius WebSocket for efficient monitoring
  connectHeliusWebSocket();
});