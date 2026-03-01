import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { MessageItem } from './MessageItem';
import { Send, Hash, User as UserIcon, Image as ImageIcon, X } from 'lucide-react';
import { gun, user as gunUser, GunService } from '../services/gun';
import { ApiService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

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

const IMPOSTER_TOPICS = [
  { crew: 'Lion', imposter: 'A Big Cat' },
  { crew: 'Pizza', imposter: 'A type of fast food' },
  { crew: 'France', imposter: 'A country in Europe' },
  { crew: 'Coffee', imposter: 'A popular morning drink' },
  { crew: 'Sushi', imposter: 'A dish from Asia' },
  { crew: 'Elephant', imposter: 'A very large animal' },
  { crew: 'Guitar', imposter: 'A stringed instrument' },
  { crew: 'Mars', imposter: 'A planet in our solar system' },
  { crew: 'Titanic', imposter: 'A famous historical ship' },
  { crew: 'Basketball', imposter: 'A team sport with a ball' },
  { crew: 'Apple', imposter: 'A common fruit' },
  { crew: 'London', imposter: 'A major city in Europe' },
  { crew: 'Minecraft', imposter: 'A popular video game' },
  { crew: 'Spider-Man', imposter: 'A famous superhero' },
  { crew: 'Tesla', imposter: 'An electric car brand' },
  { crew: 'Harry Potter', imposter: 'A famous book character' },
  { crew: 'YouTube', imposter: 'A video sharing platform' },
  { crew: 'Amazon', imposter: 'A large online retailer' },
  { crew: 'Star Wars', imposter: 'A famous space movie franchise' },
  { crew: 'The Eiffel Tower', imposter: 'A famous landmark in Paris' }
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
  const [imposterState, setImposterState] = useState<{
    status: string,
    players: string[],
    imposter: string,
    topic: string,
    imposterTopic: string,
    turnIndex: number,
    votes: Record<string, string>
  } | null>(null);
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
    const imposterNode = GunService.imposter;
    
    imposterNode.on((data: any) => {
      if (data) {
        setImposterState(prev => ({
          ...prev,
          status: data.status || 'inactive',
          imposter: data.imposter || '',
          topic: data.topic || '',
          imposterTopic: data.imposterTopic || '',
          turnIndex: typeof data.turnIndex === 'number' ? data.turnIndex : parseInt(data.turnIndex || '0'),
          players: prev?.players || [],
          votes: prev?.votes || {}
        }));
      } else {
        setImposterState(null);
      }
    });

    // Listen for players separately
    imposterNode.get('players_list').map().on((val: any, user: string) => {
      setImposterState(prev => {
        const players = prev?.players || [];
        if (val) {
          if (!players.includes(user)) {
            return { ...prev!, players: [...players, user] };
          }
        } else {
          return { ...prev!, players: players.filter(p => p !== user) };
        }
        return prev;
      });
    });

    // Listen for votes separately
    imposterNode.get('votes_list').map().on((target: any, voter: string) => {
      setImposterState(prev => {
        const votes = prev?.votes || {};
        if (target) {
          return { ...prev!, votes: { ...votes, [voter]: target } };
        } else {
          const newVotes = { ...votes };
          delete newVotes[voter];
          return { ...prev!, votes: newVotes };
        }
      });
    });

    return () => {
      GunService.wordle.off();
      imposterNode.off();
      imposterNode.get('players_list').off();
      imposterNode.get('votes_list').off();
    };
  }, []);

  useEffect(() => {
    if (imposterState?.status === 'voting' && imposterState.players.length > 0) {
      const voteCount = Object.keys(imposterState.votes).length;
      if (voteCount === imposterState.players.length) {
        // Only the imposter or the first player in the list processes the votes to avoid multiple messages
        // Actually, anyone can process it but we should guard it.
        // Let's use a simple guard: only the first player in the alphabetical list processes it.
        const sortedPlayers = [...imposterState.players].sort();
        if (currentUser.username === sortedPlayers[0]) {
          processImposterVotes(imposterState.votes);
        }
      }
    }
  }, [imposterState?.votes, imposterState?.status, imposterState?.players, currentUser.username]);

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
          // Prevent duplicates
          if (prev.some(m => m.id === id)) return prev;
          
          const newMsg: Message = {
            id,
            sender: msg.sender,
            sender_pic: msg.sender_pic,
            text: msg.text || '',
            timestamp: msg.timestamp || Date.now(),
            reactions: (() => {
              try {
                return typeof msg.reactions === 'string' ? JSON.parse(msg.reactions) : (Array.isArray(msg.reactions) ? msg.reactions : []);
              } catch (e) {
                return [];
              }
            })(),
            recipient: msg.recipient,
            image: msg.image
          };

          // If it's a private message and we're the recipient, add to recent chats
          if (recipient && msg.sender !== currentUser.username) {
            gunUser.get('profile').get('recentChats').get(msg.sender).put(true);
          }

          const updated = [...prev, newMsg].sort((a, b) => a.timestamp - b.timestamp);
          // Keep only last 200 messages for performance
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

    // Handle Wordle Commands
    if (!recipient && trimmedInput.toLowerCase().startsWith('/wordle')) {
      const command = trimmedInput.toLowerCase();
      
      if (command === '/wordle cancel') {
        if (!wordleState?.active) {
          sendSystemMessage('No Wordle game is currently in progress.');
        } else {
          const revealedWord = wordleState.word;
          sendSystemMessage(`🚫 **Wordle Cancelled!**\n\nThe word was: **${revealedWord}**\n\n*Game ended by ${currentUser.username}*`);
          
          // Reset game
          GunService.wordle.put({
            active: false,
            word: '',
            guesses: 0,
            startTime: 0
          });
        }
        setInputText('');
        return;
      }

      if (command === '/wordle') {
        if (wordleState?.active) {
          sendSystemMessage('A Wordle game is already in progress!');
        } else {
          const randomWord = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
          GunService.wordle.put({
            active: true,
            word: randomWord,
            guesses: 0,
            startTime: Date.now()
          });
          sendSystemMessage('🎮 **Multiplayer Wordle Started!** Guess the 5-letter word by typing `guess <word>`.');
        }
        setInputText('');
        return;
      }
    }

    if (!recipient && trimmedInput.toLowerCase().startsWith('guess ')) {
      if (wordleState?.active) {
        const guess = trimmedInput.split(' ')[1]?.toUpperCase();
        if (!guess || guess.length !== 5) {
          sendSystemMessage('Your guess must be a valid 5-letter word.');
          setInputText('');
          return;
        }

        // Process Wordle logic but ALSO send the message so others see the guess
        processWordleGuess(guess);
      }
    }

    // Handle Imposter Commands
    if (!recipient && trimmedInput.toLowerCase().startsWith('/imposter')) {
      const command = trimmedInput.toLowerCase();
      
      if (command === '/imposter') {
        if (imposterState && imposterState.status !== 'inactive') {
          sendSystemMessage('An Imposter game is already in progress!');
        } else {
          // Reset the entire game state
          const imposterNode = GunService.imposter;
          imposterNode.put({
            status: 'lobby',
            imposter: '',
            topic: '',
            imposterTopic: '',
            turnIndex: 0,
            startTime: Date.now()
          });
          // Clear sub-nodes
          imposterNode.get('players_list').put(null);
          imposterNode.get('votes_list').put(null);
          
          // Reset local state immediately for the starter
          setImposterState({
            status: 'lobby',
            players: [],
            imposter: '',
            topic: '',
            imposterTopic: '',
            turnIndex: 0,
            votes: {}
          });

          sendSystemMessage('🕵️ **A new Imposter game is forming!** Type `/imposter join` to participate.');
        }
        setInputText('');
        return;
      }

      if (command === '/imposter join') {
        if (!imposterState || imposterState.status !== 'lobby') {
          // If state is null, it might be syncing. Try to fetch once.
          GunService.imposter.once((data: any) => {
            if (data && data.status === 'lobby') {
              sendSystemMessage('Game state synced. Please try joining again!');
            } else {
              sendSystemMessage('No Imposter game is currently forming.');
            }
          });
        } else if (imposterState.players.includes(currentUser.username)) {
          sendSystemMessage('You’re already in the game.');
        } else {
          GunService.imposter.get('players_list').get(currentUser.username).put(true);
          sendSystemMessage(`✅ **${currentUser.username}** joined the Imposter game!`);
          
          // If it's the first player joining, ensure the status is set correctly
          if (imposterState.players.length === 0) {
            GunService.imposter.get('status').put('lobby');
          }
        }
        setInputText('');
        return;
      }

      if (command === '/imposter start') {
        if (!imposterState || imposterState.status !== 'lobby') {
          sendSystemMessage('No Imposter game is currently forming.');
        } else if (imposterState.players.length < 3) {
          sendSystemMessage(`The game needs at least 3 players. Current: ${imposterState.players.length}`);
        } else {
          startImposterGame();
        }
        setInputText('');
        return;
      }

      if (command === '/imposter cancel') {
        GunService.imposter.put({ status: 'inactive' });
        GunService.imposter.get('players_list').put(null);
        GunService.imposter.get('votes_list').put(null);
        sendSystemMessage('🕵️ **Imposter game cancelled.**');
        setInputText('');
        return;
      }
    }

    if (!recipient && trimmedInput.toLowerCase().startsWith('vote ')) {
      if (imposterState?.status === 'voting') {
        const target = trimmedInput.split(' ')[1];
        if (!target || !imposterState.players.includes(target)) {
          sendSystemMessage('Invalid target. Vote for a player in the game.');
        } else if (!imposterState.players.includes(currentUser.username)) {
          sendSystemMessage('Only players in the game can vote.');
        } else {
          GunService.imposter.get('votes_list').get(currentUser.username).put(target);
          sendSystemMessage(`🗳️ **${currentUser.username}** has voted!`);
          
          // Check if everyone has voted (will be handled in the listener for final processing)
        }
        setInputText('');
        return;
      }
    }

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

    // If it's the Imposter game turn, advance the turn
    if (!recipient && imposterState?.status === 'playing' && imposterState.players.includes(currentUser.username)) {
      const currentPlayer = imposterState.players[imposterState.turnIndex];
      if (currentUser.username === currentPlayer) {
        const nextTurn = imposterState.turnIndex + 1;
        GunService.imposter.get('turnIndex').put(nextTurn);
        if (nextTurn >= imposterState.players.length) {
          startImposterDiscussion();
        }
      } else {
        sendSystemMessage(`It's not your turn! It's **${currentPlayer}**'s turn.`);
        setInputText('');
        return;
      }
    }

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

  const startImposterGame = () => {
    if (!imposterState) return;
    const players = imposterState.players;
    const imposterIndex = Math.floor(Math.random() * players.length);
    const imposter = players[imposterIndex];
    const topicPair = IMPOSTER_TOPICS[Math.floor(Math.random() * IMPOSTER_TOPICS.length)];

    GunService.imposter.put({
      status: 'playing',
      imposter,
      topic: topicPair.crew,
      imposterTopic: topicPair.imposter,
      turnIndex: 0,
      startTime: Date.now()
    });
    // Clear votes for the new game
    GunService.imposter.get('votes_list').put(null);

    sendSystemMessage('🕵️ **The Imposter game is starting!** Roles have been assigned.');

    // Send private messages
    players.forEach(player => {
      const isImposter = player === imposter;
      const roleText = isImposter 
        ? `🎭 **You are the IMPOSTER!**\n\nYour vague topic: **${topicPair.imposter}**\n\nTry to blend in with the Crewmates!`
        : `🛡️ **You are a CREWMATE!**\n\nYour specific topic: **${topicPair.crew}**\n\nFind the Imposter!`;
      
      const privateNode = gun.get('calcchat_private_v2').get([player, 'System'].sort().join('_'));
      privateNode.get(uuidv4()).put({
        sender: 'System',
        sender_pic: 'https://api.dicebear.com/7.x/bottts/svg?seed=System',
        text: roleText,
        timestamp: Date.now(),
        recipient: player,
        reactions: '[]'
      });
    });

    sendSystemMessage(`It's **${players[0]}**'s turn to speak!`);
  };

  const startImposterDiscussion = () => {
    GunService.imposter.get('status').put('discussing');
    sendSystemMessage('🗣️ **Discussion Phase!** You have 1 minute to discuss who the Imposter is.');
    
    setTimeout(() => {
      startImposterVoting();
    }, 60000);
  };

  const startImposterVoting = () => {
    GunService.imposter.get('status').put('voting');
    sendSystemMessage('🗳️ **Voting Phase!** Type `vote username` to cast your vote.');
  };

  const processImposterVotes = (votes: Record<string, string>) => {
    if (!imposterState) return;
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach(target => {
      voteCounts[target] = (voteCounts[target] || 0) + 1;
    });

    let maxVotes = 0;
    let votedOut = '';
    let tie = false;

    Object.entries(voteCounts).forEach(([target, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        votedOut = target;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    });

    if (tie) {
      sendSystemMessage('⚖️ **It\'s a tie!** No one was voted out. The Imposter wins!');
      revealImposterResult(false);
    } else {
      const isImposter = votedOut === imposterState.imposter;
      sendSystemMessage(`💀 **${votedOut}** was voted out!`);
      if (isImposter) {
        sendSystemMessage('✅ They WERE the Imposter! **Crewmates win!**');
      } else {
        sendSystemMessage('❌ They were NOT the Imposter! **Imposter wins!**');
      }
      revealImposterResult(isImposter);
    }
  };

  const revealImposterResult = (crewWon: boolean) => {
    if (!imposterState) return;
    sendSystemMessage(`🕵️ The Imposter was: **${imposterState.imposter}**\nTopic: **${imposterState.topic}**\nImposter Topic: **${imposterState.imposterTopic}**`);
    
    setTimeout(() => {
      GunService.imposter.put({ status: 'inactive' });
      GunService.imposter.get('players_list').put(null);
      GunService.imposter.get('votes_list').put(null);
    }, 5000);
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
        
        <div className="ml-auto flex items-center gap-2">
          {!recipient && wordleState?.active && (
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Wordle Active</span>
                <span className="text-[9px] text-emerald-400/70 font-mono">Guesses: {wordleState.guesses}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
                <span className="text-white font-bold text-xs">W</span>
              </div>
            </div>
          )}

          {!recipient && imposterState && imposterState.status !== 'inactive' && (
            <div className={`flex items-center gap-3 px-4 py-2 border rounded-2xl animate-in fade-in slide-in-from-right-4 ${
              imposterState.status === 'lobby' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  imposterState.status === 'lobby' ? 'text-blue-500' : 'text-red-500'
                }`}>
                  {imposterState.status === 'lobby' ? 'Imposter Lobby' : 'Imposter Game'}
                </span>
                <span className={`text-[9px] font-mono ${
                  imposterState.status === 'lobby' ? 'text-blue-400/70' : 'text-red-400/70'
                }`}>
                  {imposterState.status === 'lobby' ? `${imposterState.players.length} Players` : 
                   imposterState.status === 'playing' ? `Turn: ${imposterState.players[imposterState.turnIndex]}` : 
                   imposterState.status === 'discussing' ? 'Discussing...' : 'Voting...'}
                </span>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                imposterState.status === 'lobby' ? 'bg-blue-500 shadow-blue-900/40' : 'bg-red-500 shadow-red-900/40'
              }`}>
                <span className="text-white font-bold text-xs">I</span>
              </div>
            </div>
          )}
        </div>
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
