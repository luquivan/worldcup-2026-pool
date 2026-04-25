export interface UserData {
  email: string;
  displayName: string;
  userName: string;
  photoURL: string;
  score: number;
  admin: boolean;
}

export interface UserWithId extends UserData {
  id: string;
}

export const RESERVED_USERNAMES = [
  'about', 'rules', 'edit-profile', 'editprofile', 'admin', 'api',
  'settings', 'login', 'signin', 'signup', 'register', 'logout',
  'signout', 'profile', 'user', 'users', 'league', 'leagues',
];

export const normalizeUsername = (userName: string): string =>
  userName.toLowerCase().replace(/\./g, '');

export const sanitizeUsername = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\./, '')
    .replace(/\.$/, '');

export const isReservedUsername = (userName: string): boolean =>
  RESERVED_USERNAMES.includes(normalizeUsername(userName));
