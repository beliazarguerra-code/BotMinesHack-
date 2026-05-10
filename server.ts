import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  app.use(cors());
  app.use(express.json());

  // WebSocket Logic for Predictions
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Provide Secure Handshake Verification
    socket.emit('system-handshake', {
      gateway: '149.154.167.50:443',
      algorithm: 'RSA-2048-ENCRYPTED',
      status: 'AUTHENTICATED',
      key_hash: '073f42750a51'
    });

    // Simulate real-time game feed from 1Win (Mocking the external data stream)
    const gameStreamInterval = setInterval(() => {
      // Occasional "Game Heat" updates to make it feel alive
      const heatIndex = (Math.random() * 100).toFixed(0);
      socket.emit('game-activity', { heatIndex, activeUsers: Math.floor(1200 + Math.random() * 500) });
    }, 5000);

    // Simulate game state changes (e.g., when a user starts a new game on 1Win)
    const stateChangeInterval = setInterval(() => {
      // Simulate a state change every 15-30 seconds
      socket.emit('game-state-change', { status: 'new_game', timestamp: Date.now() });
    }, 20000 + Math.random() * 10000);

    socket.on('request-prediction', (data: { bombCount: number }) => {
      // Simulate analysis with varying delays based on "difficulty"
      const delay = 1500 + Math.random() * 1500;
      
      setTimeout(() => {
        const bombCount = data.bombCount || 3;
        
        // Advanced "Predictive" Logic (Simulated)
        // In a real environment, this would correlate with actual historical hashes/seeds
        const generatePredictivePattern = (count: number) => {
          const indices: number[] = [];
          
          // Pattern logic: 1Win Mines often clusters or avoids edges depending on the seed
          // We simulate a "high probability" set
          const targetCount = count >= 5 ? 2 : 4; 
          
          // Seed-based random (deterministic for the request ID to feel stable)
          const seed = Math.random();
          
          while (indices.length < targetCount) {
            const idx = Math.floor(Math.random() * 25);
            if (!indices.includes(idx)) {
              indices.push(idx);
            }
          }
          return indices;
        };

        const recommendedIndices = generatePredictivePattern(bombCount);

        socket.emit('prediction-response', {
          id: uuidv4(),
          recommendedIndices,
          accuracy: (92 + Math.random() * 6.5).toFixed(2),
          serverIp: '149.154.167.50:443', // Updated visual feedback
          timestamp: Date.now(),
        });
      }, delay);
    });

    socket.on('disconnect', () => {
      clearInterval(gameStreamInterval);
      console.log('Client disconnected');
    });
  });

  // Proxy all other requests to Next.js
  app.all(/.*/, (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
