import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { API_CONFIG } from '../src/config/api.config';

function RootLayoutNav() {
  const { user } = useAuth();

  useEffect(() => {
    // Log API configuration on app start
    console.log('='.repeat(50));
    console.log('🏫 School Management App Started');
    console.log('🌐 API URL:', API_CONFIG.baseURL);
    console.log('⏱️  Timeout:', API_CONFIG.timeout, 'ms');
    console.log('👤 User:', user?.email || 'None');
    console.log('='.repeat(50));
  }, [user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
