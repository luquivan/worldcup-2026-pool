import { ref, get, set, update, remove, query, limitToFirst, onValue } from 'firebase/database';
import { User } from 'firebase/auth';
import { db } from '../firebase/config';
import { UserData, UserWithId } from '@prode/shared';

export const handleUserLogin = async (user: User): Promise<UserData> => {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    const usersRef = ref(db, 'users');
    const firstUserQuery = query(usersRef, limitToFirst(1));
    const usersSnapshot = await get(firstUserQuery);
    const isFirstUser = !usersSnapshot.exists();

    const userData: UserData = {
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      score: 0,
      admin: isFirstUser,
    };

    await set(userRef, userData);
    return userData;
  }

  return snapshot.val() as UserData;
};

export const updateUserProfile = async (uid: string, displayName: string): Promise<void> => {
  await update(ref(db, `users/${uid}`), { displayName });
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

export const deleteUserAccount = async (uid: string): Promise<void> => {
  const userLeaguesSnapshot = await get(ref(db, `userLeagues/${uid}`));
  if (userLeaguesSnapshot.exists()) {
    const leagueIds = Object.keys(userLeaguesSnapshot.val() as Record<string, boolean>);
    for (const leagueId of leagueIds) {
      await remove(ref(db, `leagueMembers/${leagueId}/${uid}`));
    }
    await remove(ref(db, `userLeagues/${uid}`));
  }
  await remove(ref(db, `predictions/${uid}`));
  await remove(ref(db, `users/${uid}`));
};
