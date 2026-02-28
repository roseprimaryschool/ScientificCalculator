import { User, Message } from '../types';
import { gun, user, GunService } from './gun';
import { v4 as uuidv4 } from 'uuid';

// Gun.js uses callbacks, so we'll wrap them in Promises for our ApiService
export const ApiService = {
  login: async (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      user.auth(username, password, (ack: any) => {
        if (ack.err) {
          reject(new Error(ack.err));
        } else {
          // Fetch user profile from Gun
          user.get('profile').once((profile: any) => {
            const userData: User = {
              id: user.is.pub,
              username: username,
              passwordHash: '', // We don't store password in plain text
              profilePic: profile?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
              friends: profile?.friends || []
            };
            ApiService.setCurrentUser(userData);
            resolve(userData);
          });
        }
      });
    });
  },

  signup: async (username: string, password: string, profilePic: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      user.create(username, password, (ack: any) => {
        if (ack.err) {
          reject(new Error(ack.err));
        } else {
          // Set user profile in Gun
          user.auth(username, password, () => {
             user.get('profile').put({ profilePic, friends: [] });
             const userData: User = {
               id: user.is.pub,
               username: username,
               passwordHash: '',
               profilePic,
               friends: []
             };
             ApiService.setCurrentUser(userData);
             resolve(userData);
          });
        }
      });
    });
  },

  addFriend: async (userId: string, friendUsername: string) => {
    // In Gun, we'll just add to our local friends list and sync it
    return new Promise((resolve) => {
      user.get('profile').get('friends').set(friendUsername, () => {
        resolve({ success: true });
      });
    });
  },

  updateUser: async (userId: string, profilePic: string) => {
    return new Promise((resolve) => {
      user.get('profile').put({ profilePic }, () => {
        resolve({ success: true });
      });
    });
  },

  getIsUnlocked: (): boolean => {
    return localStorage.getItem('calcchat_is_unlocked') === 'true';
  },

  setIsUnlocked: (val: boolean) => {
    localStorage.setItem('calcchat_is_unlocked', String(val));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem('calcchat_current_user');
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('calcchat_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('calcchat_current_user');
    }
  }
};
