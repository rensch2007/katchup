// Update your LogoutButton.tsx with this web-compatible version:

import React from 'react';
import { Pressable, Text, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    console.log('Logout button pressed');
    
    if (Platform.OS === 'web') {
      // For web, use the native browser confirm dialog
      const confirmed = window.confirm('Are you sure you want to logout?');
      
      if (confirmed) {
        console.log('Logout confirmed');
        try {
          await logout();
          console.log('Logout store action executed');
          router.replace('/(auth)/login');
          console.log('Navigation executed');
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    } else {
      // For native platforms, use the React Native Alert
      const Alert = require('react-native').Alert;
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              console.log('Logout confirmed');
              try {
                await logout();
                console.log('Logout store action executed');
                router.replace('/(auth)/login');
                console.log('Navigation executed');
              } catch (error) {
                console.error('Logout error:', error);
              }
            }
          }
        ]
      );
    }
  };

  return (
    <Pressable 
      className="bg-white border-2 border-gray-800 p-3 rounded-lg mt-4"
      onPress={handleLogout}
    >
      <Text className="text-black text-center font-bold">
        Logout
      </Text>
    </Pressable>
  );
}