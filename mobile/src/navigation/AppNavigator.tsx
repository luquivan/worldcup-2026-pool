import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { AppTabParamList, RootStackParamList } from './types';
import { MatchesScreen } from '../screens/app/MatchesScreen';
import { StandingsScreen } from '../screens/app/StandingsScreen';
import { LeaguesScreen } from '../screens/app/LeaguesScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { LeagueSelectorScreen } from '../screens/app/LeagueSelectorScreen';
import { useLeague } from '../context/LeagueContext';

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
);

const LeagueHeaderTitle = () => {
  const { selectedLeague } = useLeague();
  return (
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
      {selectedLeague ? selectedLeague.name : 'Sin liga'}
    </Text>
  );
};

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b' },
      tabBarActiveTintColor: '#22c55e',
      tabBarInactiveTintColor: '#64748b',
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#fff',
    }}
  >
    <Tab.Screen
      name="Matches"
      component={MatchesScreen}
      options={{
        title: 'Partidos',
        headerTitle: () => <LeagueHeaderTitle />,
        tabBarIcon: ({ focused }) => <TabIcon icon="⚽" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Standings"
      component={StandingsScreen}
      options={{
        title: 'Tabla',
        headerTitle: () => <LeagueHeaderTitle />,
        tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Leagues"
      component={LeaguesScreen}
      options={{
        title: 'Ligas',
        tabBarIcon: ({ focused }) => <TabIcon icon="🏆" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Perfil',
        tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }}>
    <Stack.Screen name="App" component={MainTabs} options={{ headerShown: false }} />
    <Stack.Screen name="LeagueSelector" component={LeagueSelectorScreen} options={{ title: 'Elegir liga', presentation: 'modal' }} />
    <Stack.Screen name="NewLeague" component={PlaceholderScreen('Nueva liga')} options={{ title: 'Nueva liga' }} />
    <Stack.Screen name="JoinLeague" component={PlaceholderScreen('Unirse a liga')} options={{ title: 'Unirse con código' }} />
  </Stack.Navigator>
);

const PlaceholderScreen = (name: string): React.FC => () => (
  <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#94a3b8', padding: 24, textAlign: 'center' }}>{name} — en desarrollo (feat/leagues)</Text>
  </View>
);
