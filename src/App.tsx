import React, { useState, useEffect } from 'react';
import { Calculator } from './components/Calculator';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { Settings } from './components/Settings';
import { AdminPanel } from './components/AdminPanel';
import { UserProfileModal } from './components/UserProfileModal';
import { User } from './types';
import { ApiService } from './services/api';
import { GunService } from './services/gun';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'lobby' | 'private' | 'settings' | 'admin'>('lobby');
  const [activeRecipient, setActiveRecipient] = useState<string | undefined>(undefined);
  const [selectedProfile, setSelectedProfile] = useState<Partial<User> | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Theme application
  useEffect(() => {
    if (currentUser?.theme || currentUser?.customBg) {
      const root = document.documentElement;
      const theme = currentUser.theme || 'default';
      
      // Remove old theme classes
      root.classList.remove('theme-default', 'theme-midnight', 'theme-sunset', 'theme-lavender', 'theme-crimson', 'theme-ocean', 'theme-forest', 'theme-rose', 'theme-gold');
      root.classList.add(`theme-${theme}`);

      if (currentUser.customBg) {
        root.style.setProperty('--custom-bg', `url(${currentUser.customBg})`);
        root.classList.add('has-custom-bg');
      } else {
        root.style.removeProperty('--custom-bg');
        root.classList.remove('has-custom-bg');
      }
    }
  }, [currentUser?.theme, currentUser?.customBg]);

  // Presence tracking
  useEffect(() => {
    if (!currentUser) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
      // Always update Gun on activity to ensure the "online" status propagates
      // even if the local state already says "online"
      if (currentUser.presence !== 'dnd') {
        ApiService.updatePresence(currentUser.username, 'online');
      }
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    // Heartbeat: Update Gun every 15 seconds to keep presence alive and sync healthy
    const heartbeat = setInterval(() => {
      const now = Date.now();
      const diff = now - lastActivity;

      if (diff < 300000) { // If active in last 5 mins
        if (currentUser.presence !== 'dnd') {
          ApiService.updatePresence(currentUser.username, 'online');
        }
      } else {
        if (currentUser.presence !== 'idle' && currentUser.presence !== 'dnd') {
          ApiService.updatePresence(currentUser.username, 'idle');
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(heartbeat);
    };
  }, [currentUser, lastActivity]);

  useEffect(() => {
    const unlocked = ApiService.getIsUnlocked();
    const user = ApiService.getCurrentUser();
    setIsUnlocked(unlocked);
    
    if (user) {
      // Check if user is banned
      GunService.banned.get(user.username).once((isBanned) => {
        if (isBanned) {
          setCurrentUser(null);
          ApiService.setCurrentUser(null);
          alert('Your account has been banned.');
        } else {
          setCurrentUser(user);
          if (user.isAdmin) setActiveView('admin');
        }
      });
    }
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
    ApiService.setIsUnlocked(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    ApiService.setCurrentUser(user);
    if (user.isAdmin) setActiveView('admin');
  };

  const handleLogout = () => {
    if (currentUser) {
      ApiService.updatePresence(currentUser.username, 'offline');
    }
    setCurrentUser(null);
    ApiService.setCurrentUser(null);
    setActiveView('lobby');
  };

  const handleViewChange = (view: 'lobby' | 'private' | 'settings' | 'admin', recipient?: string) => {
    setActiveView(view);
    setActiveRecipient(recipient);
  };

  const handleProfileClick = async (username: string) => {
    const profile = await ApiService.getUserProfile(username);
    setSelectedProfile({ username, ...profile });
  };

  const handleReturnToCalc = () => {
    setIsUnlocked(false);
    ApiService.setIsUnlocked(false);
  };

  if (!isUnlocked) {
    return (
      <div className="theme-wrapper h-screen overflow-hidden">
        <Calculator onUnlock={handleUnlock} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="theme-wrapper h-screen overflow-hidden">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  if (currentUser.isAdmin && activeView === 'admin') {
    return (
      <div className="theme-wrapper h-screen overflow-hidden">
        <AdminPanel onLogout={handleLogout} onBackToChat={() => setActiveView('lobby')} />
      </div>
    );
  }

  return (
    <div className="theme-wrapper h-screen overflow-hidden flex font-sans selection:bg-emerald-500/30">
      <Sidebar 
        currentUser={currentUser}
        onViewChange={handleViewChange}
        onProfileClick={handleProfileClick}
        onReturnToCalc={handleReturnToCalc}
        onLogout={handleLogout}
        activeView={activeView}
        activeRecipient={activeRecipient}
      />
      
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView + (activeRecipient || '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeView === 'settings' ? (
              <Settings currentUser={currentUser} onUpdate={(u) => {
                setCurrentUser(u);
                ApiService.setCurrentUser(u);
              }} />
            ) : (
              <ChatView 
                currentUser={currentUser} 
                recipient={activeRecipient}
                onUserClick={handleProfileClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <UserProfileModal 
        user={selectedProfile} 
        onClose={() => setSelectedProfile(null)} 
      />
    </div>
  );
}
