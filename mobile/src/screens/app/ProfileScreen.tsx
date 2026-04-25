import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/authService';

export const ProfileScreen: React.FC = () => {
  const { user, userData } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{userData?.displayName || user?.displayName || 'Usuario'}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.score}>Puntos: {userData?.score ?? 0}</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { color: '#94a3b8', fontSize: 15, marginBottom: 8 },
  score: { color: '#22c55e', fontSize: 18, fontWeight: '600', marginBottom: 32 },
  button: { backgroundColor: '#ef4444', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
