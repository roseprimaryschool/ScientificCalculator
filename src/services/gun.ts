import Gun from 'gun';
import 'gun/sea'; // Security, Encryption, Authorization
import 'gun/axe'; // Performance

// Public relay peers for Gun - using a more robust and diverse set
const peers = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://gun-eu.herokuapp.com/gun',
  'https://gunjs.herokuapp.com/gun',
  'https://www.raygun.live/gun',
  'https://peer.wall.org/gun',
  'https://gun-server.herokuapp.com/gun',
  'https://gun-amsterdam.herokuapp.com/gun',
  'https://gun-sydney.herokuapp.com/gun'
];

export const gun = Gun({ 
  peers,
  localStorage: true,
  radisk: true,
  retry: 500, // Even faster retry for better connectivity
  wait: 200, // Shorter wait for faster response
  timeout: 5000 // Reasonable timeout for peer discovery
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
    if (!mesh) return false;
    return Object.values(mesh.peers || {}).some((peer: any) => peer.wire && peer.wire.readyState === 1);
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
