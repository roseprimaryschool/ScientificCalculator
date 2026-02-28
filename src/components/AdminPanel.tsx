import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';
import { GunService } from '../services/gun';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, UserX, UserCheck, Search, Trash2, LogOut } from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
  onBackToChat: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBackToChat }) => {
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for banned users
    const unsubscribe = GunService.banned.map().on((val, username) => {
      if (val) {
        setBannedUsers(prev => prev.includes(username) ? prev : [...prev, username]);
      } else {
        setBannedUsers(prev => prev.filter(u => u !== username));
      }
    });
    return () => unsubscribe;
  }, []);

  const handleBan = async () => {
    if (!searchUsername.trim()) return;
    setLoading(true);
    try {
      await ApiService.banUser(searchUsername.trim());
      setMessage(`User ${searchUsername} has been banned.`);
      setSearchUsername('');
    } catch (err) {
      setMessage('Failed to ban user.');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUnban = async (username: string) => {
    setLoading(true);
    try {
      await ApiService.unbanUser(username);
      setMessage(`User ${username} has been unbanned.`);
    } catch (err) {
      setMessage('Failed to unban user.');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white p-8">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Control Panel</h1>
            <p className="text-zinc-500">Manage users and security</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToChat}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl transition-all font-bold"
          >
            Back to Chat
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ban User Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-500" />
            Ban a User
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="text"
                placeholder="Enter username to ban..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all"
              />
            </div>
            <button 
              onClick={handleBan}
              disabled={loading || !searchUsername.trim()}
              className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold transition-all shadow-lg shadow-red-900/20"
            >
              {loading ? 'Processing...' : 'Ban User Permanently'}
            </button>
            <AnimatePresence>
              {message && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm font-medium text-emerald-500"
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Banned Users List */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md flex flex-col h-[500px]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-zinc-500" />
            Banned Users List ({bannedUsers.length})
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
            {bannedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                <UserCheck className="w-12 h-12 mb-4 opacity-20" />
                <p>No users are currently banned</p>
              </div>
            ) : (
              bannedUsers.map(username => (
                <div 
                  key={username}
                  className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-red-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                      <UserX className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="font-bold">{username}</span>
                  </div>
                  <button 
                    onClick={() => handleUnban(username)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-emerald-600/20 hover:text-emerald-500 rounded-xl text-xs font-bold transition-all"
                  >
                    Unban User
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
