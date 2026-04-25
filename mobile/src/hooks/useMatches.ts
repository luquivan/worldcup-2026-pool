import { useEffect, useState } from 'react';
import { fetchMatches } from '../services/matchService';
import { subscribeToPredictions } from '../services/predictionService';
import { useAuth } from '../context/AuthContext';
import { Match, MatchesData, UserPredictions } from '@prode/shared';

export interface MatchSection {
  date: string;
  matches: Match[];
}

const groupByDate = (data: MatchesData): MatchSection[] => {
  const grouped: Record<string, Match[]> = {};

  Object.values(data).forEach((match) => {
    const date = new Date(match.date).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(match);
  });

  return Object.entries(grouped)
    .map(([date, matches]) => ({
      date,
      matches: matches.sort((a, b) => a.timestamp - b.timestamp),
    }))
    .sort((a, b) => {
      const firstA = a.matches[0].timestamp;
      const firstB = b.matches[0].timestamp;
      return firstA - firstB;
    });
};

export const useMatches = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState<MatchSection[]>([]);
  const [predictions, setPredictions] = useState<UserPredictions>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchMatches();
      setSections(groupByDate(data));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToPredictions(user.uid, setPredictions);
    return unsub;
  }, [user?.uid]);

  const refresh = () => {
    setRefreshing(true);
    load(true);
  };

  return { sections, predictions, loading, refreshing, refresh };
};
