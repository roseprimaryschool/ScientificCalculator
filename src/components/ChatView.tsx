import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { MessageItem } from './MessageItem';
import { Send, Hash, User as UserIcon } from 'lucide-react';
import { gun, GunService } from '../services/gun';
import { v4 as uuidv4 } from 'uuid';

interface ChatViewProps {
  currentUser: User;
  recipient?: string; // undefined for lobby
  onUserClick: (username: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ currentUser, recipient, onUserClick }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gun.js real-time listener
    const chatNode = recipient 
      ? gun.get('calcchat_private_v2').get([currentUser.username, recipient].sort().join('_'))
      : gun.get('calcchat_lobby_v2');

    const unsubscribe = chatNode.map().on((msg: any, id: string) => {
      if (msg && msg.text) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === id)) return prev;
          const newMsg: Message = {
            id,
            sender: msg.sender,
            sender_pic: msg.sender_pic,
            text: msg.text,
            timestamp: msg.timestamp,
            reactions: msg.reactions ? JSON.parse(msg.reactions) : [],
            recipient: msg.recipient
          };
          return [...prev, newMsg].sort((a, b) => a.timestamp - b.timestamp);
        });
      }
    });

    return () => {
      // Gun doesn't have a direct "off" for map().on() in some versions, 
      // but we can clear the state when switching rooms
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
    if (!inputText.trim()) return;

    const chatNode = recipient 
      ? gun.get('calcchat_private_v2').get([currentUser.username, recipient].sort().join('_'))
      : gun.get('calcchat_lobby_v2');

    const msgId = uuidv4();
    chatNode.get(msgId).put({
      sender: currentUser.username,
      sender_pic: currentUser.profilePic,
      text: inputText,
      timestamp: Date.now(),
      recipient: recipient || '',
      reactions: '[]'
    });

    setInputText('');
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

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="p-4 border-bottom border-zinc-800 flex items-center gap-3 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          {recipient ? <UserIcon className="text-emerald-500 w-5 h-5" /> : <Hash className="text-emerald-500 w-5 h-5" />}
        </div>
        <div>
          <h3 className="text-white font-bold">{recipient || 'Public Lobby'}</h3>
          <p className="text-zinc-500 text-xs">{recipient ? 'Private Chat' : 'Everyone is here'}</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
      >
        {messages.map((msg: any) => {
          return (
            <div key={msg.id} onClick={() => !recipient && msg.sender !== currentUser.username && onUserClick(msg.sender)}>
              <MessageItem
                message={msg}
                isOwn={msg.sender === currentUser.username}
                onReact={(emoji) => handleReact(msg.id, emoji)}
                profilePic={msg.sender_pic}
              />
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-zinc-900/50 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
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
