import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { colors, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: typography.label.fontSize,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Weather', tabBarIcon: () => <Text>🌦️</Text> }} />
      <Tabs.Screen name="storms" options={{ title: 'Storms', tabBarIcon: () => <Text>⛈️</Text> }} />
      <Tabs.Screen name="document" options={{ title: 'Document', tabBarIcon: () => <Text>📷</Text> }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: () => <Text>🗺️</Text> }} />
    </Tabs>
  );
}
