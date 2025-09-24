
import { Stack, useGlobalSearchParams } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

  useEffect(() => {
    // Set up global error logging with proper error handling
    try {
      setupErrorLogging();
      console.log('✅ Error logging initialized successfully');
    } catch (error) {
      console.error('❌ Failed to setup error logging:', error);
    }

    // Handle device emulation for web platform
    if (Platform.OS === 'web') {
      try {
        // If there's a new emulate parameter, store it
        if (emulate) {
          localStorage.setItem(STORAGE_KEY, emulate);
          setStoredEmulate(emulate);
        } else {
          // If no emulate parameter, try to get from localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setStoredEmulate(stored);
          }
        }
      } catch (error) {
        console.error('Error handling device emulation:', error);
      }
    }
  }, [emulate]);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    try {
      const simulatedInsets = {
        ios: { top: 47, bottom: 20, left: 0, right: 0 },
        android: { top: 40, bottom: 0, left: 0, right: 0 },
      };

      // Use stored emulate value if available, otherwise use the current emulate parameter
      const deviceToEmulate = storedEmulate || emulate;
      insetsToUse = deviceToEmulate ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
    } catch (error) {
      console.error('Error calculating insets:', error);
      insetsToUse = actualInsets;
    }
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
          }}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
