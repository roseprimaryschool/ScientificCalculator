export interface User {
  id: string;
  username: string;
  passwordHash: string;
  profilePic: string;
  friends: string[];
  createdAt?: number;
  lastOnline?: number;
  isAdmin?: boolean;
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
}

export interface ChatState {
  isUnlocked: boolean;
  currentUser: User | null;
}
