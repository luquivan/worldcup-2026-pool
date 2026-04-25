import React, { createContext, useContext, useEffect, useState } from 'react';
import { LeagueWithId } from '@prode/shared';
import { subscribeToUserLeagues } from '../services/leagueService';
import { useAuth } from './AuthContext';

interface LeagueContextValue {
  leagues: LeagueWithId[];
  selectedLeague: LeagueWithId | null;
  setSelectedLeague: (league: LeagueWithId | null) => void;
  loading: boolean;
}

const LeagueContext = createContext<LeagueContextValue>({
  leagues: [],
  selectedLeague: null,
  setSelectedLeague: () => {},
  loading: true,
});

export const LeagueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<LeagueWithId[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<LeagueWithId | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLeagues([]);
      setSelectedLeague(null);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserLeagues(user.uid, (updatedLeagues) => {
      setLeagues(updatedLeagues);
      // Auto-select first league if none selected
      if (!selectedLeague && updatedLeagues.length > 0) {
        setSelectedLeague(updatedLeagues[0]);
      }
      // Sync selected league data if it was updated
      if (selectedLeague) {
        const updated = updatedLeagues.find((l) => l.id === selectedLeague.id);
        if (updated) setSelectedLeague(updated);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]);

  return (
    <LeagueContext.Provider value={{ leagues, selectedLeague, setSelectedLeague, loading }}>
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => useContext(LeagueContext);
