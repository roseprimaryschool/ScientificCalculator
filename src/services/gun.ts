import Gun from 'gun';
import 'gun/sea'; // Security, Encryption, Authorization
import 'gun/axe'; // Performance

// Public relay peers for Gun
const peers = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export const gun = Gun({ peers });
export const user = gun.user().recall({ sessionStorage: true });

export const GunService = {
  // We'll use this to sync messages and reactions
  messages: gun.get('calcchat_messages_v2'),
  
  // We'll use this for global user discovery (optional)
  users: gun.get('calcchat_users_v2')
};
