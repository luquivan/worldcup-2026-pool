import { ref, get, set, update, remove, query, limitToFirst, onValue } from 'firebase/database';
import { User } from 'firebase/auth';
import { db } from '../firebase/config';
import {
  UserData, UserWithId,
  normalizeUsername, sanitizeUsername, isReservedUsername,
} from '@prode/shared';

export { normalizeUsername, sanitizeUsername, isReservedUsername };

export const handleUserLogin = async (user: User): Promise<UserData> => {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    const usersRef = ref(db, 'users');
    const firstUserQuery = query(usersRef, limitToFirst(1));
    const usersSnapshot = await get(firstUserQuery);
    const isFirstUser = !usersSnapshot.exists();

    const baseUserName = user.email ? user.email.split('@')[0] : 'user';
    const userName = await generateUniqueUsername(baseUserName);

    const userData: UserData = {
      email: user.email || '',
      displayName: user.displayName || '',
      userName,
      photoURL: user.photoURL || '',
      score: 0,
      admin: isFirstUser,
    };

    await set(userRef, userData);
    await set(ref(db, `usernames/${normalizeUsername(userName)}`), user.uid);
    return userData;
  }

  return snapshot.val() as UserData;
};

const checkUsernameAvailable = async (userName: string, currentUid?: string): Promise<boolean> => {
  const normalized = normalizeUsername(userName);
  if (!normalized || normalized.length < 3) return false;
  if (isReservedUsername(userName)) return false;

  const snapshot = await get(ref(db, `usernames/${normalized}`));
  if (!snapshot.exists()) return true;
  if (currentUid && snapshot.val() === currentUid) return true;
  return false;
};

const generateUniqueUsername = async (baseUserName: string): Promise<string> => {
  let userName = sanitizeUsername(baseUserName);
  let suffix = 0;
  while (!(await checkUsernameAvailable(userName))) {
    suffix++;
    userName = `${sanitizeUsername(baseUserName)}${suffix}`;
  }
  return userName;
};

export const updateUserProfile = async (
  uid: string,
  data: { userName: string; displayName: string },
  oldUserName?: string
): Promise<void> => {
  const newUserName = sanitizeUsername(data.userName);
  const normalizedNew = normalizeUsername(newUserName);
  const normalizedOld = oldUserName ? normalizeUsername(oldUserName) : '';

  if (normalizedOld && normalizedOld !== normalizedNew) {
    if (isReservedUsername(newUserName)) throw new Error('Username is reserved');
    const isAvailable = await checkUsernameAvailable(newUserName, uid);
    if (!isAvailable) throw new Error('Username is already taken');
    await remove(ref(db, `usernames/${normalizedOld}`));
    await set(ref(db, `usernames/${normalizedNew}`), uid);
  }

  await update(ref(db, `users/${uid}`), {
    userName: newUserName,
    displayName: data.displayName,
  });
};

export const subscribeToLeaderboard = (
  memberIds: string[],
  callback: (users: UserWithId[]) => void
): (() => void) => {
  const usersRef = ref(db, 'users');
  return onValue(usersRef, (snapshot) => {
    const data = snapshot.val() as Record<string, UserData> | null;
    if (!data) { callback([]); return; }
    const users: UserWithId[] = Object.entries(data)
      .filter(([id]) => memberIds.includes(id))
      .map(([id, user]) => ({ id, ...user }))
      .sort((a, b) => b.score - a.score);
    callback(users);
  });
};

export const deleteUserAccount = async (uid: string, userName: string): Promise<void> => {
  const userLeaguesSnapshot = await get(ref(db, `userLeagues/${uid}`));
  if (userLeaguesSnapshot.exists()) {
    const leagueIds = Object.keys(userLeaguesSnapshot.val() as Record<string, boolean>);
    for (const leagueId of leagueIds) {
      await remove(ref(db, `leagueMembers/${leagueId}/${uid}`));
    }
    await remove(ref(db, `userLeagues/${uid}`));
  }
  await remove(ref(db, `predictions/${uid}`));
  await remove(ref(db, `usernames/${normalizeUsername(userName)}`));
  await remove(ref(db, `users/${uid}`));
};
