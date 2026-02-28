import React, { useState, useEffect } from 'react';
import { Calculator } from './components/Calculator';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { Settings } from './components/Settings';
import { User } from './types';
import { ApiService } from './services/api';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'lobby' | 'private' | 'settings'>('lobby');
  const [activeRecipient, setActiveRecipient] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unlocked = ApiService.getIsUnlocked();
    const user = ApiService.getCurrentUser();
    setIsUnlocked(unlocked);
    setCurrentUser(user);
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
    ApiService.setIsUnlocked(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    ApiService.setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    ApiService.setCurrentUser(null);
  };

  const handleViewChange = (view: 'lobby' | 'private' | 'settings', recipient?: string) => {
    setActiveView(view);
    setActiveRecipient(recipient);
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

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans selection:bg-emerald-500/30">
      <Sidebar 
        currentUser={currentUser}
        onViewChange={handleViewChange}
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
                onUserClick={(username) => handleViewChange('private', username)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
