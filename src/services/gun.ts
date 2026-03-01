import Gun from 'gun';
import 'gun/sea'; // Security, Encryption, Authorization

// Public relay peers for Gun - using a more robust and diverse set
const peers = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gunjs.herokuapp.com/gun',
  'https://www.raygun.live/gun',
  'https://peer.wall.org/gun'
];

export const gun = Gun({ 
  peers,
  localStorage: true,
  radisk: false // Disable radisk in browser to avoid sync conflicts
});
export const user = gun.user().recall({ sessionStorage: true });

// Log authentication status
gun.on('auth', (ack: any) => {
  console.log('Gun.js Authenticated:', ack.put?.alias || 'Unknown User');
});

export const GunService = {
  // Check if we have active peer connections
  isConnected: () => {
    const mesh = (gun as any)._?.opt?.mesh;
    if (!mesh) return true; // Default to true if mesh isn't ready to avoid false "Syncing"
    const peers = mesh.peers || {};
    return Object.values(peers).some((peer: any) => {
      // Check for any peer that is connected or has a wire
      return peer.wire && (peer.wire.readyState === 1 || peer.wire.readyState === 0);
    });
  },

  // We'll use this to sync messages and reactions
  messages: gun.get('calcchat_messages_v2'),
  
  // We'll use this for global user discovery (optional)
  users: gun.get('calcchat_users_v2'),

  // Global list of banned usernames
  banned: gun.get('calcchat_banned_v2'),

  // Admin logs
  logs: gun.get('calcchat_logs_v2'),

  // Global presence
  presence: gun.get('calcchat_presence_v2'),

  // Wordle game state
  wordle: gun.get('calcchat_wordle_v2'),

  // Imposter game state
  imposter: gun.get('calcchat_imposter_v2')
};
