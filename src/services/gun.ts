import Gun from 'gun';
import 'gun/sea'; // Security, Encryption, Authorization
import 'gun/axe'; // Performance

// Public relay peers for Gun - using multiple reliable ones for better sync
const peers = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://gun-eu.herokuapp.com/gun',
  'https://gunjs.herokuapp.com/gun',
  'https://www.raygun.live/gun'
];

export const gun = Gun({ 
  peers,
  localStorage: true,
  radisk: true // Better storage management
});
export const user = gun.user().recall({ sessionStorage: true });

export const GunService = {
  // We'll use this to sync messages and reactions
  messages: gun.get('calcchat_messages_v2'),
  
  // We'll use this for global user discovery (optional)
  users: gun.get('calcchat_users_v2'),

  // Global list of banned usernames
  banned: gun.get('calcchat_banned_v2'),

  // Admin logs
  logs: gun.get('calcchat_logs_v2'),

  // Global presence
  presence: gun.get('calcchat_presence_v2')
};
