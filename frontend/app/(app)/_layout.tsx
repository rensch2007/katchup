import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f9fafb' },
      }}
    >
      <Stack.Screen name="create-room" />
      <Stack.Screen name="join-room" />
      <Stack.Screen name="notifications" />
      <Stack.Screen 
        name="room/[id]"
        options={{
          headerShown: true,
          headerTitle: 'Room Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="profile"
        options={{
          headerShown: true,
          headerTitle: 'My Profile',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}