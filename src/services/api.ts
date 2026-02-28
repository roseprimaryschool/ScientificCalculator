import { User, Message } from '../types';
import { gun, user, GunService } from './gun';
import { v4 as uuidv4 } from 'uuid';

// Gun.js uses callbacks, so we'll wrap them in Promises for our ApiService
export const ApiService = {
  login: async (username: string, password: string): Promise<User> => {
    // Special Admin Login
    if (username === 'Admin' && password === 'adminadmin123') {
      const adminUser: User = {
        id: 'admin_id',
        username: 'Admin',
        passwordHash: '',
        profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        friends: [],
        isAdmin: true,
        createdAt: Date.now(),
        lastOnline: Date.now(),
        presence: 'online'
      };
      ApiService.setCurrentUser(adminUser);
      ApiService.logAdminAction('login', 'Admin', 'Admin logged in');
      return adminUser;
    }

    // Check if user is banned
    const isBanned = await new Promise((resolve) => {
      GunService.banned.get(username).once((val) => resolve(!!val));
    });
    if (isBanned) throw new Error('Your account has been banned.');

    return new Promise((resolve, reject) => {
      user.auth(username, password, (ack: any) => {
        if (ack.err) {
          reject(new Error(ack.err));
        } else {
          // Update last online
          user.get('profile').put({ lastOnline: Date.now() });

          // Fetch user profile from Gun
          user.get('profile').once((profile: any) => {
            const now = Date.now();
            const userData: User = {
              id: user.is.pub,
              username: username,
              passwordHash: '',
              profilePic: profile?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
              friends: profile?.friends || [],
              createdAt: profile?.createdAt || now,
              lastOnline: now,
              bio: profile?.bio || '',
              statusMessage: profile?.statusMessage || '',
              theme: profile?.theme || 'default',
              customBg: profile?.customBg || '',
              presence: 'online'
            };
            
            // Update global user list for lookup
            GunService.users.get(username).put({
              username,
              profilePic: userData.profilePic,
              createdAt: userData.createdAt,
              lastOnline: now,
              bio: userData.bio,
              statusMessage: userData.statusMessage,
              theme: userData.theme,
              customBg: userData.customBg,
              presence: 'online'
            });

            ApiService.logAdminAction('login', username, `${username} logged in`);
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
             const now = Date.now();
             user.get('profile').put({ 
               profilePic, 
               friends: [], 
               createdAt: now, 
               lastOnline: now,
               bio: '',
               statusMessage: '',
               theme: 'default',
               customBg: '',
               presence: 'online'
             });
             
             // Update global user list
             GunService.users.get(username).put({
               username,
               profilePic,
               createdAt: now,
               lastOnline: now,
               bio: '',
               statusMessage: '',
               theme: 'default',
               customBg: '',
               presence: 'online'
             });

             ApiService.logAdminAction('signup', username, `New account created: ${username}`);

             const userData: User = {
               id: user.is.pub,
               username: username,
               passwordHash: '',
               profilePic,
               friends: [],
               createdAt: now,
               lastOnline: now,
               bio: '',
               statusMessage: '',
               theme: 'default',
               customBg: '',
               presence: 'online'
             };
             ApiService.setCurrentUser(userData);
             resolve(userData);
          });
        }
      });
    });
  },

  banUser: async (username: string, admin: string) => {
    return new Promise((resolve) => {
      GunService.banned.get(username).put(true, () => {
        ApiService.logAdminAction('ban', username, `User banned by ${admin}`, admin);
        resolve({ success: true });
      });
    });
  },

  unbanUser: async (username: string, admin: string) => {
    return new Promise((resolve) => {
      GunService.banned.get(username).put(false, () => {
        ApiService.logAdminAction('unban', username, `User unbanned by ${admin}`, admin);
        resolve({ success: true });
      });
    });
  },

  getUserProfile: async (username: string): Promise<Partial<User>> => {
    return new Promise((resolve) => {
      GunService.users.get(username).once((data: any) => {
        resolve(data || {});
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

  updateUser: async (userId: string, updates: Partial<User>) => {
    return new Promise((resolve) => {
      user.get('profile').put(updates, () => {
        // Also update global user list
        const currentUser = ApiService.getCurrentUser();
        if (currentUser) {
          GunService.users.get(currentUser.username).put(updates);
          
          // Log profile change
          if (updates.bio !== undefined || updates.statusMessage !== undefined || updates.profilePic !== undefined) {
             ApiService.logAdminAction('profile_update', currentUser.username, `Profile updated: ${Object.keys(updates).join(', ')}`);
          }
        }
        resolve({ success: true });
      });
    });
  },

  updatePresence: async (username: string, presence: string) => {
    const now = Date.now();
    GunService.presence.get(username).put({ presence, lastActive: now });
    GunService.users.get(username).put({ presence, lastOnline: now });
  },

  logAdminAction: (action: string, target: string, details: string, admin: string = 'System') => {
    const logId = uuidv4();
    GunService.logs.get(logId).put({
      id: logId,
      action,
      target,
      details,
      admin,
      timestamp: Date.now()
    });
  },

  deleteMessage: async (chatId: string, messageId: string, admin: string, isLobby: boolean = false) => {
    const chatNode = isLobby 
      ? gun.get('calcchat_lobby_v2')
      : gun.get('calcchat_private_v2').get(chatId);
    
    return new Promise((resolve) => {
      chatNode.get(messageId).put(null, () => {
        ApiService.logAdminAction('message_deletion', messageId, `Message deleted by ${admin}`, admin);
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
