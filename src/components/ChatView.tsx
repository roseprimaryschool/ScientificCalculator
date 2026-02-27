import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { StorageService } from '../services/storage';
import { MessageItem } from './MessageItem';
import { Send, Hash, User as UserIcon } from 'lucide-react';
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
    const loadMessages = () => {
      const allMessages = StorageService.getMessages();
      const filtered = allMessages.filter(m => {
        if (!recipient) return !m.recipient; // Lobby
        return (m.sender === currentUser.username && m.recipient === recipient) ||
               (m.sender === recipient && m.recipient === currentUser.username);
      });
      setMessages(filtered);
    };

    loadMessages();
    const interval = setInterval(loadMessages, 1000); // Poll for new messages
    return () => clearInterval(interval);
  }, [recipient, currentUser.username]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: uuidv4(),
      sender: currentUser.username,
      text: inputText,
      timestamp: Date.now(),
      reactions: [],
      recipient
    };

    StorageService.saveMessage(newMessage);
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const handleReact = (messageId: string, emoji: string) => {
    const allMessages = StorageService.getMessages();
    const msgIndex = allMessages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const msg = allMessages[msgIndex];
    const reactionIndex = msg.reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex > -1) {
      const reaction = msg.reactions[reactionIndex];
      if (!reaction.users.includes(currentUser.username)) {
        reaction.users.push(currentUser.username);
        reaction.count += 1;
      }
    } else {
      msg.reactions.push({
        emoji,
        count: 1,
        users: [currentUser.username]
      });
    }

    StorageService.updateMessage(msg);
    setMessages(prev => prev.map(m => m.id === messageId ? msg : m));
  };

  const users = StorageService.getUsers();

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
        {messages.map((msg) => {
          const senderUser = users.find(u => u.username === msg.sender);
          return (
            <div key={msg.id} onClick={() => !recipient && msg.sender !== currentUser.username && onUserClick(msg.sender)}>
              <MessageItem
                message={msg}
                isOwn={msg.sender === currentUser.username}
                onReact={(emoji) => handleReact(msg.id, emoji)}
                profilePic={senderUser?.profilePic}
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
