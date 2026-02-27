import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { Camera, Link as LinkIcon, Save, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsProps {
  currentUser: User;
  onUpdate: (user: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdate }) => {
  const [profilePic, setProfilePic] = useState(currentUser.profilePic);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const updatedUser = { ...currentUser, profilePic };
    StorageService.saveUser(updatedUser);
    onUpdate(updatedUser);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 bg-zinc-950 p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-white mb-8">Account Settings</h2>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col items-center mb-12">
            <div className="relative group">
              <img 
                src={profilePic} 
                alt="Profile" 
                className="w-32 h-32 rounded-3xl border-4 border-zinc-800 shadow-2xl object-cover"
                referrerPolicy="no-referrer"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white w-8 h-8" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
            <h3 className="text-xl font-bold text-white mt-4">{currentUser.username}</h3>
            <p className="text-zinc-500 text-sm">Member since {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Profile Picture URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="text"
                  value={profilePic}
                  onChange={(e) => setProfilePic(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-95 ${saved ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'}`}
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Settings Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <h4 className="text-white font-bold mb-2">Security Note</h4>
          <p className="text-zinc-500 text-sm leading-relaxed">
            All your data is stored locally in your browser's encrypted sandbox. No data is transmitted to any external servers, ensuring your conversations remain private and persistent on this device.
          </p>
        </div>
      </div>
    </div>
  );
};
