import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';
import { gun, user as gunUser, GunService } from '../services/gun';
import { 
  MessageSquare, 
  Users, 
  Settings as SettingsIcon, 
  Calculator as CalcIcon,
  Plus,
  LogOut,
  ChevronRight,
  Clock,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentUser: User;
  onViewChange: (view: 'lobby' | 'private' | 'settings' | 'admin', recipient?: string) => void;
  onProfileClick: (username: string) => void;
  onReturnToCalc: () => void;
  onLogout: () => void;
  activeView: string;
  activeRecipient?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  onViewChange, 
  onProfileClick,
  onReturnToCalc, 
  onLogout,
  activeView,
  activeRecipient
}) => {
  const [friendUsername, setFriendUsername] = useState('');
  const [recentChats, setRecentChats] = useState<string[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, { presence: string, statusMessage?: string }>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    // Listen for presence of friends and recent chats
    const usersToTrack = [...currentUser.friends, ...recentChats];

    usersToTrack.forEach(username => {
      GunService.users.get(username).on((data: any) => {
        if (data) {
          setPresenceMap(prev => ({
            ...prev,
            [username]: { 
              presence: data.presence || 'offline',
              statusMessage: data.statusMessage || ''
            }
          }));
        }
      });
    });

    return () => {
      usersToTrack.forEach(username => {
        GunService.users.get(username).off();
      });
    };
  }, [currentUser.friends, recentChats]);

  useEffect(() => {
    if (!currentUser.isAdmin) {
      const recentChatsNode = gunUser.get('profile').get('recentChats');
      recentChatsNode.map().on((val, key) => {
        if (val) {
          setRecentChats(prev => prev.includes(key) ? prev : [...prev, key]);
        }
      });
      return () => {
        recentChatsNode.off();
      };
    }
  }, [currentUser.isAdmin]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await ApiService.addFriend(currentUser.id, friendUsername);
      // Update local user state
      const updatedUser = { ...currentUser, friends: [...currentUser.friends, friendUsername] };
      ApiService.setCurrentUser(updatedUser);
      
      // Also add to recent chats
      gunUser.get('profile').get('recentChats').get(friendUsername).put(true);
      
      setFriendUsername('');
      onViewChange('private', friendUsername);
    } catch (err: any) {
      setError(err.message || 'Failed to add friend');
    }
  };

  return (
    <div className="w-72 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <img 
              src={currentUser.profilePic} 
              alt={currentUser.username} 
              className="w-10 h-10 rounded-xl border border-zinc-700 shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
              currentUser.presence === 'online' ? 'bg-emerald-500' : 
              currentUser.presence === 'idle' ? 'bg-yellow-500' : 
              currentUser.presence === 'dnd' ? 'bg-red-500' : 'bg-zinc-500'
            }`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm truncate">{currentUser.username}</h4>
            <p className="text-emerald-500 text-[10px] truncate italic">{currentUser.statusMessage || 'No status set'}</p>
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
          {currentUser.isAdmin && (
            <button
              onClick={() => onViewChange('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeView === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Admin Panel</span>
            </button>
          )}
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
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend}`} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onProfileClick(friend);
                    }}
                    className="w-8 h-8 rounded-lg border border-zinc-800 cursor-pointer hover:opacity-80 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-zinc-900 ${
                    presenceMap[friend]?.presence === 'online' ? 'bg-emerald-500' : 
                    presenceMap[friend]?.presence === 'idle' ? 'bg-yellow-500' : 
                    presenceMap[friend]?.presence === 'dnd' ? 'bg-red-500' : 'bg-zinc-500'
                  }`}></div>
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm text-zinc-300 font-medium truncate w-full text-left">{friend}</span>
                  {presenceMap[friend]?.statusMessage && (
                    <span className="text-[10px] text-zinc-500 truncate w-full text-left italic">{presenceMap[friend].statusMessage}</span>
                  )}
                </div>
              </div>
              <ChevronRight className={`w-3 h-3 text-zinc-600 flex-shrink-0 ${activeRecipient === friend ? 'text-emerald-500' : ''}`} />
            </button>
          ))}
        </div>

        {recentChats.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Recent Chats</h5>
              <Clock className="w-3 h-3 text-zinc-500" />
            </div>
            <div className="space-y-2">
              {recentChats.filter(chat => !currentUser.friends.includes(chat)).map(chat => (
                <button
                  key={chat}
                  onClick={() => onViewChange('private', chat)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${activeRecipient === chat ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800/50'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          onProfileClick(chat);
                        }}
                        className="w-8 h-8 rounded-lg border border-zinc-800 cursor-pointer hover:opacity-80 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-zinc-900 ${
                        presenceMap[chat]?.presence === 'online' ? 'bg-emerald-500' : 
                        presenceMap[chat]?.presence === 'idle' ? 'bg-yellow-500' : 
                        presenceMap[chat]?.presence === 'dnd' ? 'bg-red-500' : 'bg-zinc-500'
                      }`}></div>
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm text-zinc-300 font-medium truncate w-full text-left">{chat}</span>
                      {presenceMap[chat]?.statusMessage && (
                        <span className="text-[10px] text-zinc-500 truncate w-full text-left italic">{presenceMap[chat].statusMessage}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={`w-3 h-3 text-zinc-600 flex-shrink-0 ${activeRecipient === chat ? 'text-emerald-500' : ''}`} />
                </button>
              ))}
            </div>
          </div>
        )}
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
