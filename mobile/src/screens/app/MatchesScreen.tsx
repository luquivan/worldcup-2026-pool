import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLeague } from '../../context/LeagueContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

export const MatchesScreen: React.FC = () => {
  const { selectedLeague } = useLeague();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!selectedLeague) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🏆</Text>
        <Text style={styles.emptyTitle}>Seleccioná una liga</Text>
        <Text style={styles.emptyText}>Necesitás unirte o crear una liga para hacer predicciones</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LeagueSelector')}>
          <Text style={styles.buttonText}>Elegir liga</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Pantalla de partidos — {selectedLeague.name}</Text>
      <Text style={styles.sub}>Rama implementa esta pantalla (feat/matches)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  placeholder: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 16 },
  sub: { color: '#64748b', fontSize: 13, textAlign: 'center', padding: 8 },
  empty: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#94a3b8', fontSize: 15, textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#22c55e', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
