import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/store/authContext';
import { RoomProvider } from '../src/store/roomContext';
import { NotificationProvider } from '../src/store/notificationContext';
import './global.css';

// This component handles routing based on authentication state
function AuthRedirect() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  
  useEffect(() => {
    // Skip redirect if still loading
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user || !token) {
      // If the user is not logged in and not on the auth screen, redirect to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // If the user is logged in and on the auth screen, redirect to the app
      if (inAuthGroup) {
        router.replace('/');
      }
    }
  }, [user, token, segments, isLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RoomProvider>
        <NotificationProvider>
          <AuthRedirect />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
          </Stack>
        </NotificationProvider>
      </RoomProvider>
    </AuthProvider>
  );
}