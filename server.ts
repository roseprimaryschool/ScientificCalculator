import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('calcchat.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    passwordHash TEXT,
    profilePic TEXT
  );

  CREATE TABLE IF NOT EXISTS friends (
    user_id TEXT,
    friend_id TEXT,
    PRIMARY KEY (user_id, friend_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    recipient_id TEXT,
    text TEXT,
    timestamp INTEGER
  );

  CREATE TABLE IF NOT EXISTS reactions (
    message_id TEXT,
    user_id TEXT,
    emoji TEXT,
    PRIMARY KEY (message_id, user_id, emoji)
  );
`);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // Auth API
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (user && user.passwordHash === password) {
      const friends = db.prepare('SELECT u.username FROM users u JOIN friends f ON u.id = f.friend_id WHERE f.user_id = ?').all(user.id).map(f => f.username);
      res.json({ ...user, friends });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post('/api/auth/signup', (req, res) => {
    const { username, password, profilePic } = req.body;
    try {
      const id = uuidv4();
      db.prepare('INSERT INTO users (id, username, passwordHash, profilePic) VALUES (?, ?, ?, ?)').run(id, username, password, profilePic);
      res.json({ id, username, profilePic, friends: [] });
    } catch (e) {
      res.status(400).json({ error: 'Username already exists' });
    }
  });

  // Friends API
  app.post('/api/friends/add', (req, res) => {
    const { userId, friendUsername } = req.body;
    const friend = db.prepare('SELECT id FROM users WHERE username = ?').get(friendUsername);
    if (!friend) return res.status(404).json({ error: 'User not found' });
    
    try {
      db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)').run(userId, friend.id);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: 'Already friends' });
    }
  });

  // Settings API
  app.post('/api/user/update', (req, res) => {
    const { userId, profilePic } = req.body;
    db.prepare('UPDATE users SET profilePic = ? WHERE id = ?').run(profilePic, userId);
    res.json({ success: true });
  });

  // WebSocket handling
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    let currentUserId: string | null = null;

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'auth') {
        currentUserId = message.userId;
        clients.set(currentUserId!, ws);
        
        // Send initial history
        const allMessages = db.prepare(`
          SELECT m.*, u.username as sender_name, u.profilePic as sender_pic 
          FROM messages m 
          JOIN users u ON m.sender_id = u.id 
          ORDER BY m.timestamp ASC
        `).all();

        const messagesWithReactions = allMessages.map(m => {
          const reactions = db.prepare('SELECT emoji, COUNT(*) as count FROM reactions WHERE message_id = ? GROUP BY emoji').all(m.id);
          return { ...m, reactions: reactions.map(r => ({ emoji: r.emoji, count: r.count, users: [] })) };
        });

        ws.send(JSON.stringify({ type: 'history', messages: messagesWithReactions }));
      }

      if (message.type === 'chat') {
        const msgId = uuidv4();
        const timestamp = Date.now();
        const recipientId = message.recipientName ? db.prepare('SELECT id FROM users WHERE username = ?').get(message.recipientName)?.id : null;

        db.prepare('INSERT INTO messages (id, sender_id, recipient_id, text, timestamp) VALUES (?, ?, ?, ?, ?)')
          .run(msgId, currentUserId, recipientId, message.text, timestamp);

        const sender = db.prepare('SELECT username, profilePic FROM users WHERE id = ?').get(currentUserId);
        const broadcastMsg = {
          type: 'new_message',
          message: {
            id: msgId,
            sender: sender.username,
            sender_pic: sender.profilePic,
            text: message.text,
            timestamp,
            reactions: [],
            recipient: message.recipientName
          }
        };

        const broadcastStr = JSON.stringify(broadcastMsg);
        if (!recipientId) {
          // Broadcast to everyone for lobby
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(broadcastStr);
          });
        } else {
          // Send to sender and recipient
          clients.get(currentUserId!)?.send(broadcastStr);
          if (recipientId !== currentUserId) {
            clients.get(recipientId)?.send(broadcastStr);
          }
        }
      }

      if (message.type === 'reaction') {
        db.prepare('INSERT OR IGNORE INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)')
          .run(message.messageId, currentUserId, message.emoji);
        
        const reactions = db.prepare('SELECT emoji, COUNT(*) as count FROM reactions WHERE message_id = ? GROUP BY emoji').all(message.messageId);
        const broadcastReaction = {
          type: 'reaction_update',
          messageId: message.messageId,
          reactions: reactions.map(r => ({ emoji: r.emoji, count: r.count, users: [] }))
        };
        
        const broadcastStr = JSON.stringify(broadcastReaction);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) client.send(broadcastStr);
        });
      }
    });

    ws.on('close', () => {
      if (currentUserId) clients.delete(currentUserId);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
