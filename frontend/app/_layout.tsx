// Update your app/_layout.tsx with additional debugging:

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import './global.css';

export default function RootLayout() {
  const { isAuthenticated, isLoading, restoreToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreToken();
  }, []);

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, isLoading }); // Debug log
    console.log('Current segments:', segments); // Debug log
    
    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoading) {
      if (!isAuthenticated && !inAuthGroup) {
        console.log('Redirecting to login');
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        console.log('Redirecting to app');
        router.replace('/(app)');
      }
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}