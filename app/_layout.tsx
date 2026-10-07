import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DatabaseProvider } from '@/database/DatabaseProvider';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

function RootNavigator() {
  const { colors, scheme } = useTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="storm/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <RootNavigator />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
