import React from 'react';
import {
  View, Text, SectionList, StyleSheet, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useMatches } from '../../hooks/useMatches';
import { useAuth } from '../../context/AuthContext';
import { useLeague } from '../../context/LeagueContext';
import { MatchCard } from '../../components/MatchCard';
import { Match } from '@prode/shared';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

export const MatchesScreen: React.FC = () => {
  const { user } = useAuth();
  const { selectedLeague, leagues } = useLeague();
  const { sections, predictions, loading, refreshing, refresh } = useMatches();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Liga selector banner — solo si tiene ligas */}
      {leagues.length > 0 && (
        <TouchableOpacity
          style={styles.leagueBanner}
          onPress={() => navigation.navigate('LeagueSelector')}
        >
          <Text style={styles.bannerLabel}>
            {selectedLeague ? `🏆 ${selectedLeague.name}` : '🏆 Sin liga seleccionada'}
          </Text>
          <Text style={styles.bannerChange}>Cambiar ›</Text>
        </TouchableOpacity>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item: Match) => String(item.game)}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            userId={user?.uid}
            prediction={predictions[String(item.game)]}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.date}</Text>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No hay partidos disponibles</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  list: { paddingBottom: 24 },
  leagueBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  bannerLabel: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  bannerChange: { color: '#22c55e', fontSize: 13 },
  sectionHeader: {
    backgroundColor: '#0f172a', paddingHorizontal: 16,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  sectionTitle: {
    color: '#94a3b8', fontSize: 13, fontWeight: '600', textTransform: 'capitalize',
  },
  emptyText: { color: '#64748b', fontSize: 15 },
});
