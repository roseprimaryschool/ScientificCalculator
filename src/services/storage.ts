import { User, Message } from '../types';

const STORAGE_KEYS = {
  USERS: 'calcchat_users',
  MESSAGES: 'calcchat_messages',
  CURRENT_USER: 'calcchat_current_user',
  IS_UNLOCKED: 'calcchat_is_unlocked',
};

export const StorageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: User) => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.username === user.username);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUser: (username: string): User | undefined => {
    return StorageService.getUsers().find(u => u.username === username);
  },

  getMessages: (): Message[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  saveMessage: (message: Message) => {
    const messages = StorageService.getMessages();
    messages.push(message);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  updateMessage: (updatedMessage: Message) => {
    const messages = StorageService.getMessages();
    const index = messages.findIndex(m => m.id === updatedMessage.id);
    if (index > -1) {
      messages[index] = updatedMessage;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  },

  getIsUnlocked: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.IS_UNLOCKED) === 'true';
  },

  setIsUnlocked: (val: boolean) => {
    localStorage.setItem(STORAGE_KEYS.IS_UNLOCKED, String(val));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
};
