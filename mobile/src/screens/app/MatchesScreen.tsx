import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, SectionList, StyleSheet, ActivityIndicator,
  TouchableOpacity, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useLeague } from '../../context/LeagueContext';
import { useMatches } from '../../hooks/useMatches';
import { MatchCard } from '../../components/MatchCard';
import { FilterBar, MatchFilter } from '../../components/FilterBar';
import { Match } from '@prode/shared';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

const GROUP_KEY = '@prode/selectedGroup';

const GroupChips: React.FC<{
  letters: string[];
  selected: string | null;
  onSelect: (l: string) => void;
}> = ({ letters, selected, onSelect }) => (
  <View style={chipStyles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chipStyles.scroll}
    >
      {letters.map(l => (
        <TouchableOpacity
          key={l}
          style={[chipStyles.chip, selected === l && chipStyles.chipActive]}
          onPress={() => onSelect(l)}
          activeOpacity={0.7}
        >
          <Text style={[chipStyles.label, selected === l && chipStyles.labelActive]}>
            {l}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export const MatchesScreen: React.FC = () => {
  const { user } = useAuth();
  const { selectedLeague, leagues } = useLeague();
  const [filter, setFilter] = useState<MatchFilter>('date');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { sections, predictions, loading, refreshing, refresh } = useMatches(filter);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const listRef = useRef<SectionList<Match>>(null);

  // Al entrar al tab Grupos: restaurar último grupo o defaultear a 'A'
  useEffect(() => {
    if (filter === 'group') {
      AsyncStorage.getItem(GROUP_KEY)
        .then(val => setSelectedGroup(val ?? 'A'))
        .catch(() => setSelectedGroup('A'));
    } else {
      setSelectedGroup(null);
    }
  }, [filter]);

  const groupLetters = filter === 'group'
    ? sections.map(s => s.title.replace('Grupo ', ''))
    : [];

  const selectGroup = (letter: string) => {
    setSelectedGroup(letter);
    AsyncStorage.setItem(GROUP_KEY, letter).catch(() => {});
    // Scroll al top. Como filtramos a 1 sección, sectionIndex:0 siempre es válido
    setTimeout(() => {
      listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: false });
    }, 50);
  };

  const visibleSections = filter === 'group' && selectedGroup
    ? sections.filter(s => s.title === `Grupo ${selectedGroup}`)
    : sections;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner de liga */}
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

      <FilterBar active={filter} onChange={setFilter} />

      {filter === 'group' && groupLetters.length > 0 && (
        <GroupChips
          letters={groupLetters}
          selected={selectedGroup}
          onSelect={selectGroup}
        />
      )}

      <SectionList
        ref={listRef}
        sections={visibleSections}
        keyExtractor={(item: Match) => String(item.game)}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            userId={user?.uid}
            prediction={predictions[String(item.game)]}
            showDate={filter !== 'date'}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {filter === 'knockout'
                ? 'Los partidos de eliminatoria aparecerán cuando avance el torneo'
                : 'No hay partidos disponibles'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const chipStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  scroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  chip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: { backgroundColor: '#22c55e' },
  label: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  labelActive: { color: '#fff' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', padding: 32 },
  list: { paddingBottom: 32, paddingTop: 8 },
  leagueBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  bannerLabel: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  bannerChange: { color: '#22c55e', fontSize: 13 },
  sectionHeader: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
