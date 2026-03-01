import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPICS = [
  { crew: "Lion", imposter: "Large Feline" },
  { crew: "Pizza", imposter: "Italian Food" },
  { crew: "France", imposter: "European Country" },
  { crew: "Guitar", imposter: "Musical Instrument" },
  { crew: "Apple", imposter: "Fruit" },
  { crew: "Mars", imposter: "Planet" },
  { crew: "Titanic", imposter: "Famous Ship" },
  { crew: "Mona Lisa", imposter: "Famous Painting" },
  { crew: "Basketball", imposter: "Ball Sport" },
  { crew: "Sushi", imposter: "Japanese Food" },
  { crew: "Elephant", imposter: "Large Herbivore" },
  { crew: "London", imposter: "Major City" },
  { crew: "Spiderman", imposter: "Superhero" },
  { crew: "Minecraft", imposter: "Video Game" },
  { crew: "Harry Potter", imposter: "Book Character" },
];

interface Player {
  id: string;
  username: string;
  role?: "crew" | "imposter";
  topic?: string;
  hasSpoken: boolean;
  vote?: string;
}

let gameState: "idle" | "lobby" | "turns" | "discussion" | "voting" = "idle";
let players: Player[] = [];
let currentTopic: { crew: string; imposter: string } | null = null;
let turnIndex = 0;
let discussionTimer: NodeJS.Timeout | null = null;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_chat", (data: { username: string, profilePic?: string }) => {
      socket.data.username = data.username;
      socket.data.profilePic = data.profilePic;
      console.log(`${data.username} joined chat`);
    });

    socket.on("send_message", (message: string) => {
      const username = socket.data.username || "Anonymous";
      
      // Handle commands
      if (message.startsWith("/imposter")) {
        const parts = message.split(" ");
        const cmd = parts[1];

        if (!cmd) {
          if (gameState !== "idle") {
            socket.emit("system_message", "An Imposter game is already in progress!");
            return;
          }
          gameState = "lobby";
          players = [];
          io.emit("system_message", "A new Imposter game is forming! Type /imposter join to participate.");
          return;
        }

        if (cmd === "join") {
          if (gameState !== "lobby") {
            socket.emit("system_message", "No game is currently forming. Use /imposter to start one.");
            return;
          }
          if (players.find(p => p.username === username)) {
            socket.emit("system_message", "You’re already in the game.");
            return;
          }
          players.push({ id: socket.id, username, hasSpoken: false });
          io.emit("system_message", `${username} has joined the game! (${players.length} players)`);

          if (players.length >= 3) {
            // Start game after a short delay to allow more people to join if they want?
            // User says "The game can only start when at least 3 players have joined."
            // I'll add a manual start or auto-start? 
            // "When ready, the system announces: 'The Imposter game is starting!'"
            // I'll add a /imposter start command for the person who started it? 
            // Or just auto-start at 3? Let's auto-start at 3 for simplicity, or maybe 4?
            // Actually, let's wait for a bit or add /imposter start.
            // Re-reading: "The game can only start when at least 3 players have joined."
            // I'll add /imposter start.
            io.emit("system_message", "We have enough players! Type /imposter start to begin.");
          }
          return;
        }

        if (cmd === "start") {
          if (gameState !== "lobby") return;
          if (players.length < 3) {
            socket.emit("system_message", "Need at least 3 players to start.");
            return;
          }
          startGame(io);
          return;
        }

        if (cmd === "cancel") {
          if (gameState === "idle") return;
          const imposter = players.find(p => p.role === "imposter");
          io.emit("system_message", `Game cancelled! The imposter was ${imposter?.username || "unknown"} and their topic was "${currentTopic?.imposter || "unknown"}".`);
          resetGame(io);
          return;
        }
      }

      // Handle voting
      if (gameState === "voting" && message.toLowerCase().startsWith("vote ")) {
        const targetUsername = message.substring(5).trim();
        const player = players.find(p => p.id === socket.id);
        if (!player) return;
        if (player.vote) {
          socket.emit("system_message", "You have already voted.");
          return;
        }
        const target = players.find(p => p.username.toLowerCase() === targetUsername.toLowerCase());
        if (!target) {
          socket.emit("system_message", "Invalid player to vote for.");
          return;
        }
        player.vote = target.username; // Store the original case
        socket.emit("system_message", `You voted for ${target.username}.`);
        
        const allVoted = players.every(p => p.vote);
        if (allVoted) {
          endVoting(io);
        }
        return;
      }

      // Handle game turns
      if (gameState === "turns") {
        const currentPlayer = players[turnIndex];
        if (currentPlayer.id === socket.id) {
          currentPlayer.hasSpoken = true;
          io.emit("chat_message", { id: uuidv4(), username, message, isGameMessage: true, sender_pic: socket.data.profilePic });
          turnIndex++;
          if (turnIndex >= players.length) {
            startDiscussion(io);
          } else {
            io.emit("system_message", `It's ${players[turnIndex].username}'s turn.`);
          }
          return;
        }
      }

      // Regular chat
      io.emit("chat_message", { id: uuidv4(), username, message, sender_pic: socket.data.profilePic });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // If a player disconnects during a game, we might need to handle it.
      // For now, let's just log it.
    });
  });

  function startGame(io: Server) {
    gameState = "turns";
    io.emit("system_message", "The Imposter game is starting!");
    
    // Select imposter
    const imposterIndex = Math.floor(Math.random() * players.length);
    currentTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    
    players.forEach((p, i) => {
      if (i === imposterIndex) {
        p.role = "imposter";
        p.topic = currentTopic!.imposter;
        io.to(p.id).emit("role_assignment", { role: "Imposter", topic: p.topic });
      } else {
        p.role = "crew";
        p.topic = currentTopic!.crew;
        io.to(p.id).emit("role_assignment", { role: "Crewmate", topic: p.topic });
      }
    });

    io.emit("system_message", "Roles have been assigned.");
    turnIndex = 0;
    io.emit("system_message", `Game Topic Category: ${currentTopic.imposter} (Imposter's perspective) / Specific (Crewmate's perspective)`);
    io.emit("system_message", `It's ${players[0].username}'s turn to send a message about their topic.`);
  }

  function startDiscussion(io: Server) {
    gameState = "discussion";
    io.emit("system_message", "All players have spoken! Discussion phase starts now. You have 1 minute to discuss.");
    
    discussionTimer = setTimeout(() => {
      startVoting(io);
    }, 60000);
  }

  function startVoting(io: Server) {
    gameState = "voting";
    io.emit("system_message", "Discussion over! Voting phase starts now. Type 'vote (username)' to cast your vote.");
  }

  function endVoting(io: Server) {
    gameState = "idle";
    const voteCounts: Record<string, number> = {};
    players.forEach(p => {
      if (p.vote) {
        voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1;
      }
    });

    let maxVotes = 0;
    let votedOut: string | null = null;
    let tie = false;

    for (const [user, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        votedOut = user;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    }

    if (tie || !votedOut) {
      io.emit("system_message", "It's a tie! No one was voted out.");
      const imposter = players.find(p => p.role === "imposter")!;
      io.emit("system_message", `The Imposter survives! ${imposter.username} wins! The topic was "${currentTopic?.crew}".`);
    } else {
      const targetPlayer = players.find(p => p.username === votedOut);
      const isImposter = targetPlayer?.role === "imposter";
      io.emit("system_message", `${votedOut} was voted out!`);
      if (isImposter) {
        io.emit("system_message", `They WERE the Imposter! Crewmates win!`);
      } else {
        const imposter = players.find(p => p.role === "imposter")!;
        io.emit("system_message", `They were NOT the Imposter. ${imposter.username} wins! The topic was "${currentTopic?.crew}".`);
      }
    }

    resetGame(io);
  }

  function resetGame(io: Server) {
    gameState = "idle";
    players = [];
    currentTopic = null;
    turnIndex = 0;
    if (discussionTimer) clearTimeout(discussionTimer);
    discussionTimer = null;
    io.emit("game_reset");
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
