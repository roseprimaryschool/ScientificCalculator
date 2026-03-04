import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { MessageItem } from './MessageItem';
import { Send, Hash, User as UserIcon, Image as ImageIcon, X } from 'lucide-react';
import { gun, user as gunUser, GunService } from '../services/gun';
import { ApiService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

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

const WORDLE_WORDS = [
  'APPLE', 'BEACH', 'BRAIN', 'BREAD', 'BRUSH', 'CHAIR', 'CHEST', 'CHORD', 'CLICK', 'CLOCK',
  'CLOUD', 'DANCE', 'DIARY', 'DRINK', 'DRIVE', 'EARTH', 'FEAST', 'FIELD', 'FRUIT', 'GLASS',
  'GRAPE', 'GREEN', 'GHOST', 'HEART', 'HOUSE', 'JUICE', 'LIGHT', 'LEMON', 'MELON', 'MONEY',
  'MUSIC', 'NIGHT', 'OCEAN', 'PARTY', 'PIANO', 'PILOT', 'PLANE', 'PHONE', 'PIZZA', 'PLANT',
  'RADIO', 'RIVER', 'ROBOT', 'SHIRT', 'SHOES', 'SMILE', 'SNAKE', 'SPACE', 'SPOON', 'STORM',
  'TABLE', 'TIGER', 'TOAST', 'TOUCH', 'TRAIN', 'TRUCK', 'VOICE', 'WATER', 'WATCH', 'WHALE',
  'WORLD', 'WRITE', 'YOUTH', 'ZEBRA', 'ALIVE', 'ALONE', 'ANGRY', 'ANIMAL', 'AWAKE', 'BASIC',
  'BEING', 'BIRTH', 'BLACK', 'BLIND', 'BLOOD', 'BOARD', 'BOOKS', 'BREAK', 'BUILD', 'BUSES',
  'CARRY', 'CAUSE', 'CHILD', 'CLEAN', 'CLOSE', 'COACH', 'COAST', 'COUNT', 'COURT', 'COVER',
  'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CYCLE', 'DAILY', 'DANCE', 'DEATH', 'DEPTH',
  'DIRTY', 'DOUBT', 'DREAM', 'DRESS', 'DRINK', 'DRIVE', 'DUTY', 'EARLY', 'EARTH', 'EMPTY',
  'ENEMY', 'ENJOY', 'ENTER', 'ERROR', 'EVENT', 'EVERY', 'EXIST', 'FAITH', 'FALSE', 'FAULT',
  'FIELD', 'FIGHT', 'FINAL', 'FIRST', 'FLOOR', 'FOCUS', 'FORCE', 'FRAME', 'FRESH', 'FRONT',
  'FRUIT', 'GLASS', 'GRANT', 'GRASS', 'GREAT', 'GREEN', 'GROUP', 'GUARD', 'GUESS', 'GUIDE',
  'HAPPY', 'HEART', 'HEAVY', 'HELLO', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE',
  'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JOINT', 'JUDGE', 'KNIFE', 'LARGE', 'LASER', 'LAUGH',
  'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEVEL', 'LIGHT', 'LIMIT', 'LOCAL', 'LOGIC', 'LOOSE',
  'LOWER', 'LUCKY', 'LUNCH', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH', 'MATCH', 'MAYOR', 'MEDIA',
  'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR',
  'MOUTH', 'MUSIC', 'NAKED', 'NERVE', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE', 'NORTH', 'NOTED',
  'NOVEL', 'NURSE', 'OCCUR', 'OFFER', 'ORDER', 'OTHER', 'OUTER', 'OWNER', 'PANEL', 'PAPER',
  'PARTY', 'PEACE', 'PHASE', 'PHONE', 'PHOTO', 'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN',
  'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME',
  'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE',
  'RADIO', 'RAISE', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY', 'RELAX', 'REPLY', 'RIGHT',
  'RIVER', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE',
  'SENSE', 'SERVE', 'SHAKE', 'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHIRT',
  'SHOCK', 'SHOOT', 'SHORT', 'SHOWN', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL',
  'SLEEP', 'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SOLID', 'SOLVE', 'SORRY',
  'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE',
  'SPORT', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STICK',
  'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY',
  'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN', 'TASTE', 'TAXES',
  'TEACH', 'TEETH', 'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK',
  'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THROW', 'TIGHT', 'TIMES', 'TIRED', 'TITLE',
  'TODAY', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT',
  'TREND', 'TRIAL', 'TRIED', 'TRIES', 'TRUCK', 'TRUST', 'TRUTH', 'TWICE', 'UNDER', 'UNDUE',
  'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID', 'VALUE',
  'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOICE', 'WASTE', 'WATCH', 'WATER', 'WHEEL', 'WHERE',
  'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE',
  'WORST', 'WORTH', 'WRITE', 'WRONG', 'WROTE', 'YIELD', 'YOUNG', 'YOUTH'
];

interface ChatViewProps {
  currentUser: User;
  recipient?: string; // undefined for lobby
  onUserClick: (username: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ currentUser, recipient, onUserClick }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recipientData, setRecipientData] = useState<{ presence?: string, statusMessage?: string } | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [wordleState, setWordleState] = useState<{ active: boolean, word: string, guesses: number } | null>(null);
  const [roleInfo, setRoleInfo] = useState<{ role: string, topic: string } | null>(null);
  const [imposterState, setImposterState] = useState<{
    status: 'idle' | 'lobby' | 'turns' | 'discussion' | 'voting',
    players: Record<string, any>,
    turnIndex: number,
    currentTopic?: { crew: string, imposter: string },
    discussionEndTime?: number
  }>({
    status: 'idle',
    players: {},
    turnIndex: 0
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Listen for Wordle state
    GunService.wordle.on((data: any) => {
      if (data) {
        setWordleState({
          active: !!data.active,
          word: data.word || '',
          guesses: data.guesses || 0
        });
      }
    });

    // Listen for Imposter state
    GunService.imposter.get('status').on((status: any) => {
      setImposterState(prev => ({ ...prev, status: status || 'idle' }));
    });

    GunService.imposter.get('config').on((config: any) => {
      if (config) {
        setImposterState(prev => ({
          ...prev,
          turnIndex: config.turnIndex || 0,
          currentTopic: config.currentTopic ? JSON.parse(config.currentTopic) : undefined,
          discussionEndTime: config.discussionEndTime || 0
        }));
      }
    });

    GunService.imposter.get('players').map().on((player: any, username: string) => {
      setImposterState(prev => {
        const newPlayers = { ...prev.players };
        if (player === null) {
          delete newPlayers[username];
        } else {
          newPlayers[username] = player;
        }
        return { ...prev, players: newPlayers };
      });

      // Local role info update
      if (username === currentUser.username && player) {
        if (player.role && player.topic) {
          setRoleInfo({ role: player.role, topic: player.topic });
        } else {
          setRoleInfo(null);
        }
      }
    });

    return () => {
      GunService.wordle.off();
      GunService.imposter.off();
    };
  }, [currentUser.username]);

  // Discussion timer effect
  useEffect(() => {
    if (imposterState.status === 'discussion' && imposterState.discussionEndTime) {
      const timer = setInterval(() => {
        if (Date.now() >= imposterState.discussionEndTime) {
          clearInterval(timer);
          // Only one person needs to trigger the transition
          // We'll use the first player in alphabetical order who is still online
          const sortedPlayers = Object.keys(imposterState.players).sort();
          if (sortedPlayers[0] === currentUser.username) {
            GunService.imposter.get('status').put('voting');
            sendSystemMessage("Discussion over! Voting phase starts now. Type `vote (username)` to cast your vote.");
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [imposterState.status, imposterState.discussionEndTime, currentUser.username, imposterState.players]);

  useEffect(() => {
    // Track auth status
    const checkAuth = () => {
      setIsAuth(!!gunUser.is);
    };
    checkAuth();
    gun.on('auth', checkAuth);
    
    let consecutiveOffline = 0;
    
    // Immediate connection tracking via Gun events
    const onHi = () => {
      consecutiveOffline = 0;
      setIsConnected(true);
    };
    const onBye = () => {
      // Don't immediately set to false, let the interval check it
    };
    
    gun.on('hi', onHi);
    gun.on('bye', onBye);

    const checkConnection = setInterval(() => {
      const connected = GunService.isConnected();
      if (connected) {
        consecutiveOffline = 0;
        setIsConnected(true);
      } else {
        consecutiveOffline++;
        // Only show "Connecting" if we've been offline for at least 3 checks (9 seconds)
        // This prevents the UI from flickering on minor network blips
        if (consecutiveOffline >= 3) {
          setIsConnected(false);
        }
      }
    }, 3000);
    
    return () => {
      clearInterval(checkConnection);
      // Gun.js doesn't have a simple .off() for global events like 'hi', 
      // but we can at least stop the interval
    };
  }, []);

  useEffect(() => {
    if (recipient) {
      GunService.users.get(recipient).on((data: any) => {
        if (data) {
          setRecipientData({
            presence: data.presence || 'offline',
            statusMessage: data.statusMessage || ''
          });
        }
      });
      return () => {
        GunService.users.get(recipient).off();
      };
    } else {
      setRecipientData(null);
    }
  }, [recipient]);

  useEffect(() => {
    // Gun.js real-time listener
    const chatNode = recipient 
      ? gun.get('calcchat_private_v2').get([currentUser.username, recipient].sort().join('_'))
      : gun.get('calcchat_lobby_v2');

    chatNode.map().on((msg: any, id: string) => {
      if (msg === null) {
        setMessages(prev => prev.filter(m => m.id !== id));
        return;
      }

      if (msg && (msg.text || msg.image)) {
        setMessages(prev => {
          if (prev.some(m => m.id === id)) return prev;
          
          const newMsg: Message = {
            id,
            sender: msg.sender,
            sender_pic: msg.sender_pic,
            text: msg.text || '',
            timestamp: msg.timestamp || Date.now(),
            reactions: msg.reactions ? JSON.parse(msg.reactions) : [],
            recipient: msg.recipient,
            image: msg.image,
            isGameMessage: !!msg.isGameMessage
          };

          if (recipient && msg.sender !== currentUser.username) {
            gunUser.get('profile').get('recentChats').get(msg.sender).put(true);
          }

          const updated = [...prev, newMsg].sort((a, b) => a.timestamp - b.timestamp);
          return updated.slice(-200);
        });
      }
    });

    return () => {
      chatNode.off();
      setMessages([]);
    };
  }, [recipient, currentUser.username]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, recipient]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const trimmedInput = inputText.trim();
    const isWordleGuess = !recipient && trimmedInput.toLowerCase().startsWith('guess ') && wordleState?.active;
    const isWordleCommand = !recipient && trimmedInput.toLowerCase().startsWith('/wordle');
    const isImposterCommand = !recipient && trimmedInput.toLowerCase().startsWith('/imposter');

    // 1. Handle Wordle Logic (Commands and Guesses)
    if (isWordleCommand) {
      const command = trimmedInput.toLowerCase();
      if (command === '/wordle cancel') {
        if (!wordleState?.active) {
          sendSystemMessage('No Wordle game is currently in progress.');
        } else {
          const revealedWord = wordleState.word;
          sendSystemMessage(`🚫 **Wordle Cancelled!**\n\nThe word was: **${revealedWord}**\n\n*Game ended by ${currentUser.username}*`);
          GunService.wordle.put({ active: false, word: '', guesses: 0, startTime: 0 });
        }
      } else if (command === '/wordle') {
        if (wordleState?.active) {
          sendSystemMessage('A Wordle game is already in progress!');
        } else {
          const randomWord = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
          GunService.wordle.put({ active: true, word: randomWord, guesses: 0, startTime: Date.now() });
          sendSystemMessage('🎮 **Multiplayer Wordle Started!** Guess the 5-letter word by typing `guess <word>`.');
        }
      }
      setInputText('');
      return;
    }

    if (isWordleGuess) {
      const guess = trimmedInput.split(' ')[1]?.toUpperCase();
      if (!guess || guess.length !== 5) {
        sendSystemMessage('Your guess must be a valid 5-letter word.');
        setInputText('');
        return;
      }
      processWordleGuess(guess);
      // We DON'T return here, so the guess is also sent as a chat message
    }

    // 2. Handle Imposter Commands
    if (isImposterCommand) {
      const parts = trimmedInput.split(' ');
      const cmd = parts[1]?.toLowerCase();

      if (!cmd) {
        if (imposterState.status !== 'idle') {
          sendSystemMessage('An Imposter game is already in progress!');
        } else {
          GunService.imposter.get('status').put('lobby');
          GunService.imposter.get('players').put(null);
          GunService.imposter.get('config').put({ turnIndex: 0, currentTopic: '', discussionEndTime: 0 });
          sendSystemMessage('A new Imposter game is forming! Type `/imposter join` to participate.');
        }
      } else if (cmd === 'join') {
        if (imposterState.status !== 'lobby') {
          sendSystemMessage('No game is currently forming. Use `/imposter` to start one.');
        } else if (imposterState.players[currentUser.username]) {
          sendSystemMessage('You’re already in the game.');
        } else {
          GunService.imposter.get('players').get(currentUser.username).put({
            username: currentUser.username,
            hasSpoken: false,
            vote: ''
          });
          const playerCount = Object.keys(imposterState.players).length + 1;
          sendSystemMessage(`${currentUser.username} has joined the game! (${playerCount} players)`);
          if (playerCount >= 3) sendSystemMessage('We have enough players! Type `/imposter start` to begin.');
        }
      } else if (cmd === 'start') {
        if (imposterState.status === 'lobby') {
          const playerList = Object.keys(imposterState.players);
          if (playerList.length < 3) {
            sendSystemMessage('Need at least 3 players to start.');
          } else {
            const imposterIndex = Math.floor(Math.random() * playerList.length);
            const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
            GunService.imposter.get('status').put('turns');
            GunService.imposter.get('config').put({ turnIndex: 0, currentTopic: JSON.stringify(topic) });
            playerList.forEach((uname, idx) => {
              const isImposter = idx === imposterIndex;
              GunService.imposter.get('players').get(uname).put({
                role: isImposter ? 'Imposter' : 'Crewmate',
                topic: isImposter ? topic.imposter : topic.crew,
                hasSpoken: false,
                vote: ''
              });
            });
            sendSystemMessage('The Imposter game is starting! Roles assigned.');
            sendSystemMessage(`It's ${playerList[0]}'s turn.`);
          }
        }
      } else if (cmd === 'cancel') {
        if (imposterState.status !== 'idle') {
          const imposter = Object.values(imposterState.players).find(p => p.role === 'Imposter');
          sendSystemMessage(`Game cancelled! Imposter was **${imposter?.username || 'unknown'}**. Topic: "**${imposterState.currentTopic?.imposter || 'unknown'}**".`);
          resetImposterGame();
        }
      }
      setInputText('');
      return;
    }

    // 3. Handle Voting
    if (!recipient && imposterState.status === 'voting' && trimmedInput.toLowerCase().startsWith('vote ')) {
      const targetUsername = trimmedInput.substring(5).trim();
      const player = imposterState.players[currentUser.username];
      if (player && !player.vote) {
        const target = Object.keys(imposterState.players).find(u => u.toLowerCase() === targetUsername.toLowerCase());
        if (target) {
          GunService.imposter.get('players').get(currentUser.username).get('vote').put(target);
          sendSystemMessage(`You voted for ${target}.`);
          const updatedPlayers = { ...imposterState.players };
          updatedPlayers[currentUser.username].vote = target;
          if (Object.values(updatedPlayers).every(p => p.vote)) processVotingResults(updatedPlayers);
        } else {
          sendSystemMessage('Invalid player to vote for.');
        }
      } else if (player?.vote) {
        sendSystemMessage('You have already voted.');
      }
      setInputText('');
      return;
    }

    // 4. Handle Imposter Game Turns
    if (!recipient && imposterState.status === 'turns') {
      const playerList = Object.keys(imposterState.players).sort();
      const currentPlayer = playerList[imposterState.turnIndex];
      if (currentPlayer === currentUser.username) {
        sendChatMessage(trimmedInput, true);
        const nextIndex = imposterState.turnIndex + 1;
        if (nextIndex >= playerList.length) {
          GunService.imposter.get('status').put('discussion');
          GunService.imposter.get('config').get('discussionEndTime').put(Date.now() + 60000);
          sendSystemMessage("Discussion phase starts! 1 minute remaining.");
        } else {
          GunService.imposter.get('config').get('turnIndex').put(nextIndex);
          sendSystemMessage(`It's ${playerList[nextIndex]}'s turn.`);
        }
        setInputText('');
        return;
      }
    }

    // 5. Regular Message Sending (Lobby or Private)

    const chatNode = recipient 
      ? gun.get('calcchat_private_v2').get([currentUser.username, recipient].sort().join('_'))
      : gun.get('calcchat_lobby_v2');

    const msgId = uuidv4();
    const msgData = {
      sender: currentUser.username,
      sender_pic: currentUser.profilePic,
      text: inputText,
      image: selectedImage || '',
      timestamp: Date.now(),
      recipient: recipient || '',
      reactions: '[]'
    };

    // Use a callback to ensure Gun processes the put
    chatNode.get(msgId).put(msgData, (ack: any) => {
      if (ack.err) {
        console.error('Gun.js send error:', ack.err);
        // Retry once after a short delay if it failed
        setTimeout(() => {
          chatNode.get(msgId).put(msgData);
        }, 1000);
      }
    });

    if (selectedImage) {
      ApiService.logAdminAction('image_upload', currentUser.username, `${currentUser.username} uploaded an image`);
    }

    // Add to recent chats when sending
    if (recipient) {
      gunUser.get('profile').get('recentChats').get(recipient).put(true);
    }

    setInputText('');
    setSelectedImage(null);
  };

  const sendChatMessage = (text: string, isGameMessage: boolean = false) => {
    const chatNode = gun.get('calcchat_lobby_v2');
    const msgId = uuidv4();
    chatNode.get(msgId).put({
      sender: currentUser.username,
      sender_pic: currentUser.profilePic,
      text,
      timestamp: Date.now(),
      recipient: '',
      reactions: '[]',
      isGameMessage
    });
  };

  const sendSystemMessage = (text: string) => {
    const chatNode = gun.get('calcchat_lobby_v2');
    const msgId = uuidv4();
    chatNode.get(msgId).put({
      sender: 'System',
      sender_pic: 'https://api.dicebear.com/7.x/bottts/svg?seed=System',
      text,
      timestamp: Date.now(),
      recipient: '',
      reactions: '[]'
    }, (ack: any) => {
      if (ack.err) console.error('System message error:', ack.err);
    });
  };

  const resetImposterGame = () => {
    GunService.imposter.get('status').put('idle');
    GunService.imposter.get('players').put(null);
    GunService.imposter.get('config').put({ turnIndex: 0, currentTopic: '', discussionEndTime: 0 });
    setRoleInfo(null);
  };

  const processVotingResults = (players: Record<string, any>) => {
    const voteCounts: Record<string, number> = {};
    Object.values(players).forEach(p => {
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
      sendSystemMessage("It's a tie! No one was voted out.");
      const imposter = Object.values(players).find(p => p.role === 'Imposter')!;
      sendSystemMessage(`The Imposter survives! **${imposter.username}** wins! The topic was "**${imposterState.currentTopic?.crew}**".`);
    } else {
      const targetPlayer = players[votedOut];
      const isImposter = targetPlayer?.role === 'Imposter';
      sendSystemMessage(`**${votedOut}** was voted out!`);
      if (isImposter) {
        sendSystemMessage(`They WERE the Imposter! Crewmates win!`);
      } else {
        const imposter = Object.values(players).find(p => p.role === 'Imposter')!;
        sendSystemMessage(`They were NOT the Imposter. **${imposter.username}** wins! The topic was "**${imposterState.currentTopic?.crew}**".`);
      }
    }

    resetImposterGame();
  };

  const processWordleGuess = (guess: string) => {
    if (!wordleState || !wordleState.active) return;
    
    // Use the word from the state which is synced via Gun
    const target = wordleState.word;
    if (!target) {
      console.error('Wordle target word missing in state');
      return;
    }

    const newGuessCount = (wordleState.guesses || 0) + 1;
    
    // Update guess count in Gun - this will trigger the .on() for everyone
    GunService.wordle.get('guesses').put(newGuessCount);

    let feedback = '';
    const targetArr = target.split('');
    const guessArr = guess.split('');
    const result = new Array(5).fill('⬛');

    // First pass: Green
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = '🟩';
        targetArr[i] = ''; // Mark as used
        guessArr[i] = '';
      }
    }

    // Second pass: Yellow
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] !== '') {
        const index = targetArr.indexOf(guessArr[i]);
        if (index !== -1) {
          result[i] = '🟨';
          targetArr[index] = ''; // Mark as used
        }
      }
    }

    feedback = result.join('');

    const chatNode = gun.get('calcchat_lobby_v2');
    const msgId = uuidv4();
    
    const isWin = guess === target;
    const botMsg = {
      sender: 'Wordle Bot',
      sender_pic: 'https://api.dicebear.com/7.x/bottts/svg?seed=Wordle&backgroundColor=10b981',
      text: isWin 
        ? `🎉 **${currentUser.username} GUESSED IT!**\n\nWord: **${target}**\nTotal Team Guesses: **${newGuessCount}**\n\n${feedback}\n\n*The game has ended. Type /wordle to start a new one!*`
        : `**${currentUser.username}** guessed **${guess}**:\n${feedback}`,
      timestamp: Date.now() + 50, // Ensure it appears after the user's guess
      recipient: '',
      reactions: '[]'
    };

    chatNode.get(msgId).put(botMsg, (ack: any) => {
      if (ack.err) console.error('Wordle bot message error:', ack.err);
    });
    
    if (isWin) {
      // Reset game after a delay to allow everyone to see the win
      setTimeout(() => {
        GunService.wordle.put({
          active: false,
          word: '',
          guesses: 0,
          startTime: 0
        });
      }, 2000);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    const chatNode = recipient 
      ? gun.get('calcchat_private_v2').get([currentUser.username, recipient].sort().join('_'))
      : gun.get('calcchat_lobby_v2');

    chatNode.get(messageId).once((msg: any) => {
      if (!msg) return;
      const reactions = msg.reactions ? JSON.parse(msg.reactions) : [];
      const reactionIndex = reactions.findIndex((r: any) => r.emoji === emoji);

      if (reactionIndex > -1) {
        if (!reactions[reactionIndex].users.includes(currentUser.username)) {
          reactions[reactionIndex].users.push(currentUser.username);
          reactions[reactionIndex].count += 1;
        }
      } else {
        reactions.push({
          emoji,
          count: 1,
          users: [currentUser.username]
        });
      }

      chatNode.get(messageId).get('reactions').put(JSON.stringify(reactions));
    });
  };

  const handleDelete = (messageId: string) => {
    if (!currentUser.isAdmin) return;
    const chatId = recipient ? [currentUser.username, recipient].sort().join('_') : '';
    ApiService.deleteMessage(chatId, messageId, currentUser.username, !recipient);
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-4 border-bottom border-zinc-800 flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => recipient && onUserClick(recipient)}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              {recipient ? <UserIcon className="text-emerald-500 w-5 h-5" /> : <Hash className="text-emerald-500 w-5 h-5" />}
            </div>
            {recipient && (
              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
                recipientData?.presence === 'online' ? 'bg-emerald-500' : 
                recipientData?.presence === 'idle' ? 'bg-yellow-500' : 
                recipientData?.presence === 'dnd' ? 'bg-red-500' : 'bg-zinc-500'
              }`}></div>
            )}
          </div>
          <div>
            <h3 className="text-white font-bold flex items-center gap-2">
              {recipient || 'Public Lobby'}
              {recipientData?.statusMessage && (
                <span className="text-[10px] text-emerald-500 font-normal italic">"{recipientData.statusMessage}"</span>
              )}
            </h3>
            <p className="text-zinc-500 text-xs">{recipient ? (recipientData?.presence || 'offline') : 'Everyone is here'}</p>
          </div>
        </div>
        
        {!recipient && wordleState?.active && (
          <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-right-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Wordle Active</span>
              <span className="text-[9px] text-emerald-400/70 font-mono">Guesses: {wordleState.guesses}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <span className="text-white font-bold text-xs">W</span>
            </div>
          </div>
        )}

        {!recipient && roleInfo && (
          <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-right-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{roleInfo.role}</span>
              <span className="text-[9px] text-red-400/70 font-mono">Topic: {roleInfo.topic}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shadow-lg shadow-red-900/40">
              <span className="text-white font-bold text-xs">!</span>
            </div>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
      >
        {messages.map((msg: any) => {
          return (
            <div key={msg.id}>
              <MessageItem
                message={msg}
                isOwn={msg.sender === currentUser.username}
                isAdmin={currentUser.isAdmin}
                onReact={(emoji) => handleReact(msg.id, emoji)}
                onDelete={() => handleDelete(msg.id)}
                onProfileClick={onUserClick}
                profilePic={msg.sender_pic}
              />
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-zinc-900/50 border-t border-zinc-800">
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-h-32 rounded-xl border border-zinc-700 shadow-xl"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-3 rounded-xl transition-all active:scale-95"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Type a message or paste an image..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
