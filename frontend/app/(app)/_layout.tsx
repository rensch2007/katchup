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
      <Stack.Screen name="room/[id]"/>
      <Stack.Screen name="profile"/>
      <Stack.Screen name="create-post"/>
      <Stack.Screen name="room-settings"/>
    </Stack>
  );
}