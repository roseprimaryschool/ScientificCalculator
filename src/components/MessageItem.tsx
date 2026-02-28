import React, { useState, useRef, useEffect } from 'react';
import { Message, Reaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Trash2 } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  isAdmin?: boolean;
  onReact: (emoji: string) => void;
  onDelete?: () => void;
  onProfileClick: (username: string) => void;
  profilePic?: string;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '💯'];

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, isAdmin, onReact, onDelete, onProfileClick, profilePic }) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {!isOwn && (
          <img 
            src={profilePic || message.sender_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} 
            alt={message.sender}
            onClick={() => onProfileClick(message.sender)}
            className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 cursor-pointer hover:opacity-80 transition-opacity"
            referrerPolicy="no-referrer"
          />
        )}
        
        <div className="relative group">
          <motion.div
            onDoubleClick={() => setShowReactions(true)}
            className={`
              px-4 py-2 rounded-2xl text-sm relative cursor-pointer select-none
              ${isOwn ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-100 rounded-bl-none'}
            `}
          >
            {!isOwn && (
              <div 
                onClick={() => onProfileClick(message.sender)}
                className="text-[10px] text-zinc-500 mb-1 font-bold hover:text-emerald-500 cursor-pointer"
              >
                {message.sender}
              </div>
            )}
            {message.image && (
              <img 
                src={message.image} 
                alt="Shared content" 
                className="max-w-full rounded-lg mb-2 border border-black/10 shadow-sm"
                referrerPolicy="no-referrer"
              />
            )}
            {message.text && <div>{message.text}</div>}

            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                title="Delete Message"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            
            {message.reactions.length > 0 && (
              <div className={`absolute -bottom-3 ${isOwn ? 'right-0' : 'left-0'} flex gap-1`}>
                {message.reactions.map((r, idx) => (
                  <button 
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact(r.emoji);
                    }}
                    className="bg-zinc-900 border border-zinc-700 rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 shadow-lg hover:border-emerald-500 transition-colors"
                  >
                    <span>{r.emoji}</span>
                    <span className="text-zinc-400">{r.count}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -40, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute left-0 top-0 z-50 bg-zinc-900 border border-zinc-700 rounded-full p-1 flex gap-1 shadow-2xl"
              >
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(emoji);
                      setShowReactions(false);
                    }}
                    className="hover:scale-125 transition-transform p-1 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
