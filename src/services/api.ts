import { User, Message } from '../types';

export const ApiService = {
  login: async (username: string, password: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  signup: async (username: string, password: string, profilePic: string): Promise<User> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, profilePic })
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },

  addFriend: async (userId: string, friendUsername: string) => {
    const res = await fetch('/api/friends/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, friendUsername })
    });
    if (!res.ok) throw new Error('Failed to add friend');
    return res.json();
  },

  updateUser: async (userId: string, profilePic: string) => {
    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, profilePic })
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
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
