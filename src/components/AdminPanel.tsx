import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';
import { GunService } from '../services/gun';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, UserX, UserCheck, Search, Trash2, LogOut, Users, History, Activity, Clock, FileText } from 'lucide-react';
import { AdminLog } from '../types';

interface AdminPanelProps {
  onLogout: () => void;
  onBackToChat: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBackToChat }) => {
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'bans'>('users');

  useEffect(() => {
    // Listen for banned users
    const unsubscribeBans = GunService.banned.map().on((val, username) => {
      if (val) {
        setBannedUsers(prev => prev.includes(username) ? prev : [...prev, username]);
      } else {
        setBannedUsers(prev => prev.filter(u => u !== username));
      }
    });

    // Listen for all users
    const unsubscribeUsers = GunService.users.map().on((userData: any, username: string) => {
      if (userData) {
        setAllUsers(prev => {
          const index = prev.findIndex(u => u.username === username);
          const newUser = { ...userData, username };
          if (index > -1) {
            const updated = [...prev];
            updated[index] = newUser;
            return updated;
          }
          return [...prev, newUser];
        });
      }
    });

    // Listen for logs
    const unsubscribeLogs = GunService.logs.map().on((log: any) => {
      if (log && log.id) {
        setLogs(prev => {
          if (prev.some(l => l.id === log.id)) return prev;
          return [log, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
        });
      }
    });

    return () => {
      GunService.banned.off();
      GunService.users.off();
      GunService.logs.off();
    };
  }, []);

  const handleBan = async () => {
    if (!searchUsername.trim()) return;
    setLoading(true);
    try {
      await ApiService.banUser(searchUsername.trim(), 'Admin');
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
      await ApiService.unbanUser(username, 'Admin');
      setMessage(`User ${username} has been unbanned.`);
    } catch (err) {
      setMessage('Failed to unban user.');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const formatDate = (ts?: number) => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-transparent text-white p-4 sm:p-8 pb-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
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

      <div className="flex gap-4 mb-8 border-b border-zinc-800">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Users className="w-5 h-5" />
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-4 px-4 font-bold transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <History className="w-5 h-5" />
          Admin Logs
        </button>
        <button 
          onClick={() => setActiveTab('bans')}
          className={`pb-4 px-4 font-bold transition-all flex items-center gap-2 ${activeTab === 'bans' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <UserX className="w-5 h-5" />
          Banned Users
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 gap-6 h-full overflow-y-auto pr-4 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {allUsers.map(u => (
                <div key={u.username} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img 
                        src={u.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                        className="w-16 h-16 rounded-2xl border border-zinc-800 shadow-xl"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 ${
                        u.presence === 'online' ? 'bg-emerald-500' : 
                        u.presence === 'idle' ? 'bg-yellow-500' : 
                        u.presence === 'dnd' ? 'bg-red-500' : 'bg-zinc-500'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {u.username}
                        {u.isAdmin && <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Admin</span>}
                      </h3>
                      <p className="text-emerald-500 text-xs italic">{u.statusMessage || 'No status'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Bio</p>
                      <p className="text-xs text-zinc-300 line-clamp-2">{u.bio || 'No bio provided'}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last Login: {formatDate(u.lastOnline)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md h-full flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              System Activity Logs
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-4 scrollbar-hide">
              {logs.map(log => (
                <div key={log.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-start gap-4 hover:border-zinc-700 transition-all">
                  <div className={`p-2 rounded-xl ${
                    log.action === 'ban' ? 'bg-red-500/10 text-red-500' :
                    log.action === 'login' ? 'bg-emerald-500/10 text-emerald-500' :
                    log.action === 'signup' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-zinc-500/10 text-zinc-500'
                  }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm uppercase tracking-wider">{log.action}</span>
                      <span className="text-[10px] text-zinc-500">{formatDate(log.timestamp)}</span>
                    </div>
                    <p className="text-sm text-zinc-300">{log.details}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase">
                      <span>Target: {log.target}</span>
                      <span>•</span>
                      <span>By: {log.admin}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bans' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
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
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md flex flex-col h-full overflow-hidden">
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
        )}
      </div>
    </div>
  );
};
