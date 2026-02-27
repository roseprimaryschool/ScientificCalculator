import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { 
  MessageSquare, 
  Users, 
  Settings as SettingsIcon, 
  Calculator as CalcIcon,
  Plus,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentUser: User;
  onViewChange: (view: 'lobby' | 'private' | 'settings', recipient?: string) => void;
  onReturnToCalc: () => void;
  onLogout: () => void;
  activeView: string;
  activeRecipient?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  onViewChange, 
  onReturnToCalc, 
  onLogout,
  activeView,
  activeRecipient
}) => {
  const [friendUsername, setFriendUsername] = useState('');
  const [error, setError] = useState('');

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const targetUser = StorageService.getUser(friendUsername);
    
    if (!targetUser) {
      setError('User not found');
      return;
    }
    if (targetUser.username === currentUser.username) {
      setError("Can't add yourself");
      return;
    }
    if (currentUser.friends.includes(targetUser.username)) {
      setError('Already friends');
      return;
    }

    const updatedUser = { ...currentUser, friends: [...currentUser.friends, targetUser.username] };
    StorageService.saveUser(updatedUser);
    setFriendUsername('');
    onViewChange('private', targetUser.username);
  };

  return (
    <div className="w-72 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src={currentUser.profilePic} 
            alt={currentUser.username} 
            className="w-10 h-10 rounded-xl border border-zinc-700 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div>
            <h4 className="text-white font-bold text-sm truncate w-32">{currentUser.username}</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Online</span>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => onViewChange('lobby')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeView === 'lobby' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Public Lobby</span>
          </button>
          <button
            onClick={() => onViewChange('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeView === 'settings' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Friends</h5>
          <Users className="w-3 h-3 text-zinc-500" />
        </div>

        <form onSubmit={handleAddFriend} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Add by username..."
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-[10px] text-red-500 mt-1 ml-1">{error}</p>}
        </form>

        <div className="space-y-2">
          {currentUser.friends.map(friend => (
            <button
              key={friend}
              onClick={() => onViewChange('private', friend)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${activeRecipient === friend ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800/50'}`}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={StorageService.getUser(friend)?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend}`} 
                  className="w-8 h-8 rounded-lg border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm text-zinc-300 font-medium">{friend}</span>
              </div>
              <ChevronRight className={`w-3 h-3 text-zinc-600 ${activeRecipient === friend ? 'text-emerald-500' : ''}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-zinc-800 space-y-2">
        <button
          onClick={onReturnToCalc}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
        >
          <CalcIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Calculator</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
