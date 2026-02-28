import React from 'react';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, User as UserIcon } from 'lucide-react';

interface UserProfileModalProps {
  user: Partial<User> | null;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  const formatDate = (ts?: number) => {
    if (!ts) return 'Unknown';
    return new Date(ts).toLocaleString();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
        >
          <div className="relative h-32 bg-emerald-600">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="px-6 pb-8 -mt-12 text-center">
            <div className="inline-block relative">
              <img 
                src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt={user.username}
                className="w-24 h-24 rounded-2xl border-4 border-zinc-900 bg-zinc-800 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-zinc-900 rounded-full"></div>
            </div>

            <h3 className="mt-4 text-2xl font-bold text-white">{user.username}</h3>
            <p className="text-zinc-500 text-sm">Member of CalcChat Pro</p>

            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center gap-4 p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Account Created</p>
                  <p className="text-sm text-zinc-200">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Last Online</p>
                  <p className="text-sm text-zinc-200">{formatDate(user.lastOnline)}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="mt-8 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold transition-colors"
            >
              Close Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
