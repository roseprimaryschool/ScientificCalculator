import React, { useState, useRef, useEffect } from 'react';
import { Message, Reaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Smile } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onReact: (emoji: string) => void;
  profilePic?: string;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '💯'];

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, onReact, profilePic }) => {
  const [showReactions, setShowReactions] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {!isOwn && (
          <img 
            src={profilePic || message.sender_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} 
            alt={message.sender}
            className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900"
            referrerPolicy="no-referrer"
          />
        )}
        
        <div className="relative group">
          <motion.div
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`
              px-4 py-2 rounded-2xl text-sm relative
              ${isOwn ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-100 rounded-bl-none'}
            `}
          >
            {!isOwn && <div className="text-[10px] text-zinc-500 mb-1 font-bold">{message.sender}</div>}
            {message.text}
            
            {message.reactions.length > 0 && (
              <div className={`absolute -bottom-3 ${isOwn ? 'right-0' : 'left-0'} flex gap-1`}>
                {message.reactions.map((r, idx) => (
                  <div 
                    key={idx}
                    className="bg-zinc-900 border border-zinc-700 rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 shadow-lg"
                  >
                    <span>{r.emoji}</span>
                    <span className="text-zinc-400">{r.count}</span>
                  </div>
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
