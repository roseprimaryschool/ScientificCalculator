import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { MessageItem } from './MessageItem';
import { Send, Hash, User as UserIcon, Image as ImageIcon, X } from 'lucide-react';
import { gun, user as gunUser, GunService } from '../services/gun';
import { ApiService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            reactions: msg.reactions ? JSON.parse(msg.reactions) : [],
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
        
        {!isConnected && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Network Syncing...</span>
            <button 
              onClick={() => window.location.reload()}
              className="text-[9px] bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-600 px-1.5 py-0.5 rounded transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
        
        {isConnected && !isAuth && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Verifying Identity...</span>
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
