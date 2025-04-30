import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useRoom } from '../../../src/store/roomContext';
import { useAuth } from '../../../src/store/authContext';
import { useNotification } from '../../../src/store/notificationContext';
import Layout from '../../../src/components/Layout';

type User = {
  _id: string;
  username: string;
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const { rooms, currentRoom, fetchRoom, isLoading, isLoading: roomsLoading, inviteUsers, error, clearError } = useRoom();
  const [localLoading, setLocalLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  useEffect(() => {
    const loadRoomData = async () => {
      if (!id) {
        setLoadingError('Room ID is missing');
        setLocalLoading(false);
        return;
      }

      if (!token) {
        console.log('Token not ready yet. Waiting to fetch room...');
        return; // 👈 WAIT until token exists
      }

      try {
        console.log('Fetching room with ID:', id);
        await fetchRoom(id);
        console.log('Room fetch completed');
      } catch (err) {
        console.error('Error fetching room:', err);
        setLoadingError('Failed to load room details');
      } finally {
        setLocalLoading(false);
      }
    };

    loadRoomData();
  }, [id, token]); // 👈 depend on BOTH id and token





  const handleCreatePost = () => {
    router.push('/(app)/create-post');
  };

  const getMemberUsername = (member: any) => {
    if (!member) return 'Unknown';

    if (typeof member === 'string') {
      return 'User';  // We only have the ID
    }

    if (member._id) {
      return member.username || 'Unnamed';
    }

    return 'Unknown';
  };



  // Show loading state while fetching data
  if (localLoading || isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-4 text-gray-500">Loading room...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (loadingError || error || !currentRoom) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-red-500 text-lg text-center mb-4">
          {loadingError || error || 'Room not found'}
        </Text>
        <Pressable
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => router.replace('/')}
        >
          <Text className="text-white">Return to Home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <Layout>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-center mb-2">{currentRoom.name}</Text>
        <View className="flex-row justify-center mt-4">
          <Pressable
            className="flex items-center justify-center bg-red-500 p-4 rounded-lg mb-4 mx-1 flex-1"
            onPress={handleCreatePost}
          >
            <Text className="text-white text-center font-bold">
              Create Post
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Layout>
  );
}