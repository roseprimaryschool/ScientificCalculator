export type UserPresence = 'online' | 'offline' | 'idle' | 'dnd';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  profilePic: string;
  friends: string[];
  createdAt?: number;
  lastOnline?: number;
  isAdmin?: boolean;
  bio?: string;
  statusMessage?: string;
  presence?: UserPresence;
  lastActive?: number;
  theme?: string;
  customBg?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  id: string;
  sender: string;
  sender_pic?: string;
  text: string;
  timestamp: number;
  reactions: Reaction[];
  recipient?: string; // undefined for lobby
  image?: string; // Base64 or URL
}

export interface AdminLog {
  id: string;
  action: string;
  target?: string;
  admin: string;
  timestamp: number;
  details?: string;
}

export interface ChatState {
  isUnlocked: boolean;
  currentUser: User | null;
}
