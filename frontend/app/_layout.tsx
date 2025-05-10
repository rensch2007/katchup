import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/store/authContext';
import { RoomProvider } from '../src/store/roomContext';
import { NotificationProvider } from '../src/store/notificationContext';
import { PostProvider } from '../src/store/postContext'; // ✅ add this
import './global.css';

function AuthRedirect() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user || !token) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
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
        <PostProvider> 
          <NotificationProvider>
            <AuthRedirect />
            <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(app)" options={{ gestureEnabled: false }} />
              <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
            </Stack>
          </NotificationProvider>
        </PostProvider>
      </RoomProvider>
    </AuthProvider>
  );
}
