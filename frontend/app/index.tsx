import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/store/authContext';
import { useRoom } from '../src/store/roomContext';
import { useNotification } from '../src/store/notificationContext';
import SelectRoom from './(app)/select-room'; // assuming you have this

export default function Index() {
  const { user, token, logout } = useAuth();
  const { rooms, fetchRooms, isLoading: roomsLoading } = useRoom();
  const { unreadCount } = useNotification();
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  useEffect(() => {
    if (token) {
      fetchRooms();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      if (user.defaultRoom) {
        router.replace(`/(app)/room/${user.defaultRoom}`);
      } else {
        setCheckingRedirect(false); // no default room, show select-room
      }
    }
  }, [user]);

  if (checkingRedirect) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
      </SafeAreaView>
    );
  }

  // No default room, show select-room
  return (
    <SelectRoom />
  );
}
