import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/store/authContext';
import { useRoom } from '../src/store/roomContext';
import { useNotification } from '../src/store/notificationContext';
import SelectRoom from './(app)/select-room'; // assuming you have this

export default function Index() {
  const { user, token, logout } = useAuth();
  const { rooms, fetchRooms, isLoading: roomsLoading } = useRoom();
  const { unreadCount } = useNotification();
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState({
    status: 'Checking...',
    database: 'Checking...',
    error: null as string | null
  });

  

  useEffect(() => {
    if (token) {
      fetchRooms();
    }
  }, [token]);

  const handleCreateRoom = () => {
    router.push('/(app)/create-room');
  };

  const handleJoinRoom = () => {
    router.push('/(app)/join-room');
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Something went wrong during logout');
    }
  };

  const goToNotifications = () => {
    router.push('/(app)/notifications');
  };

  return (
    <SelectRoom />
  );
}