import { ref, get, set, push, update, remove, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { League, LeagueWithId, generateSlug } from '@prode/shared';

export { generateSlug };

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

const checkSlugAvailable = async (slug: string): Promise<boolean> => {
  const snapshot = await get(ref(db, `leagueSlugs/${slug}`));
  return !snapshot.exists();
};

export const createLeague = async (
  name: string,
  ownerId: string,
  options?: { description?: string }
): Promise<LeagueWithId> => {
  let slug = generateSlug(name);
  let suffix = 0;
  while (!(await checkSlugAvailable(slug))) {
    suffix++;
    slug = `${generateSlug(name)}-${suffix}`;
  }

  const newLeagueRef = push(ref(db, 'leagues'));
  const leagueId = newLeagueRef.key!;

  const league: League = {
    name,
    slug,
    ownerId,
    inviteCode: generateInviteCode(),
    createdAt: Date.now(),
    ...(options?.description && { description: options.description }),
  };

  await set(newLeagueRef, league);
  await set(ref(db, `leagueSlugs/${slug}`), leagueId);
  await set(ref(db, `leagueMembers/${leagueId}/${ownerId}`), true);
  await set(ref(db, `userLeagues/${ownerId}/${leagueId}`), true);

  return { ...league, id: leagueId };
};

export const getLeagueByInviteCode = async (code: string): Promise<LeagueWithId | null> => {
  const snapshot = await get(ref(db, 'leagues'));
  if (!snapshot.exists()) return null;
  const leagues = snapshot.val() as Record<string, League>;
  for (const [id, league] of Object.entries(leagues)) {
    if (league.inviteCode.toUpperCase() === code.toUpperCase()) return { id, ...league };
  }
  return null;
};

export const joinLeague = async (leagueId: string, userId: string): Promise<void> => {
  await set(ref(db, `leagueMembers/${leagueId}/${userId}`), true);
  await set(ref(db, `userLeagues/${userId}/${leagueId}`), true);
};

export const leaveLeague = async (leagueId: string, userId: string): Promise<void> => {
  await remove(ref(db, `leagueMembers/${leagueId}/${userId}`));
  await remove(ref(db, `userLeagues/${userId}/${leagueId}`));
};

export const getLeagueMembers = async (leagueId: string): Promise<string[]> => {
  const snapshot = await get(ref(db, `leagueMembers/${leagueId}`));
  if (!snapshot.exists()) return [];
  return Object.keys(snapshot.val() as Record<string, boolean>);
};

export const subscribeToLeagueMembers = (
  leagueId: string,
  callback: (memberIds: string[]) => void
): (() => void) => {
  return onValue(ref(db, `leagueMembers/${leagueId}`), (snapshot) => {
    if (!snapshot.exists()) { callback([]); return; }
    callback(Object.keys(snapshot.val() as Record<string, boolean>));
  });
};

export const subscribeToUserLeagues = (
  userId: string,
  callback: (leagues: LeagueWithId[]) => void
): (() => void) => {
  return onValue(ref(db, `userLeagues/${userId}`), async (snapshot) => {
    if (!snapshot.exists()) { callback([]); return; }
    const leagueIds = Object.keys(snapshot.val() as Record<string, boolean>);
    const leagues: LeagueWithId[] = [];
    for (const leagueId of leagueIds) {
      const leagueSnapshot = await get(ref(db, `leagues/${leagueId}`));
      if (leagueSnapshot.exists()) {
        const membersSnapshot = await get(ref(db, `leagueMembers/${leagueId}`));
        const memberCount = membersSnapshot.exists()
          ? Object.keys(membersSnapshot.val() as Record<string, boolean>).length : 0;
        leagues.push({ id: leagueId, ...(leagueSnapshot.val() as League), memberCount });
      }
    }
    callback(leagues);
  });
};

export const regenerateInviteCode = async (leagueId: string): Promise<string> => {
  const newCode = generateInviteCode();
  await update(ref(db, `leagues/${leagueId}`), { inviteCode: newCode });
  return newCode;
};

export const updateLeague = async (
  leagueId: string,
  updates: { name?: string; description?: string }
): Promise<void> => {
  const filtered: Record<string, string> = {};
  if (updates.name) filtered.name = updates.name;
  if (updates.description !== undefined) filtered.description = updates.description;
  await update(ref(db, `leagues/${leagueId}`), filtered);
};

export const deleteLeague = async (leagueId: string, slug: string): Promise<void> => {
  const memberIds = await getLeagueMembers(leagueId);
  for (const memberId of memberIds) {
    await remove(ref(db, `userLeagues/${memberId}/${leagueId}`));
  }
  await remove(ref(db, `leagueMembers/${leagueId}`));
  await remove(ref(db, `leagueSlugs/${slug}`));
  await remove(ref(db, `leagues/${leagueId}`));
};
