export interface User {
  username: string;
  passwordHash: string;
  profilePic: string;
  friends: string[];
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  reactions: Reaction[];
  recipient?: string; // undefined for lobby
}

export interface ChatState {
  isUnlocked: boolean;
  currentUser: User | null;
}
