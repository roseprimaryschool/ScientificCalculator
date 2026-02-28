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
    return <Calculator onUnlock={handleUnlock} />;
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  if (currentUser.isAdmin && activeView === 'admin') {
    return <AdminPanel onLogout={handleLogout} onBackToChat={() => setActiveView('lobby')} />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans selection:bg-emerald-500/30">
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
