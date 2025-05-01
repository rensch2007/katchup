import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Pressable,
  FlatList
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useRoom } from '../../../src/store/roomContext';
import { useAuth } from '../../../src/store/authContext';
import Layout from '../../../src/components/Layout';
import PostCard from '../../../src/components/PostCard';

type Post = {
  id: string;
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const {
    rooms,
    currentRoom,
    fetchRoom,
    isLoading,
    inviteUsers,
    error,
    clearError
  } = useRoom();

  const [localLoading, setLocalLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    const loadRoomData = async () => {
      if (!id) {
        setLoadingError('Room ID is missing');
        setLocalLoading(false);
        return;
      }

      if (!token) {
        console.log('Token not ready yet. Waiting to fetch room...');
        return;
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
  }, [id, token]);

  const fetchPosts = async () => {
    if (isFetchingPosts || !hasMorePosts) return;
    setIsFetchingPosts(true);

    // Simulate API call delay
    setTimeout(() => {
      const newPosts = Array.from({ length: 5 }, (_, i) => ({
        id: `${Date.now()}-${i}`
      }));
      

      setPosts((prev) => [...prev, ...newPosts]);
      if (newPosts.length === 0) setHasMorePosts(false);
      setIsFetchingPosts(false);
    }, 1000);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    router.push('/(app)/create-post');
  };

  if (localLoading || isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-4 text-gray-500">Loading room...</Text>
      </SafeAreaView>
    );
  }

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
      <View className="flex-1">
        <FlatList
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }} // padding to avoid overlap
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard />}
          ListHeaderComponent={
            <Text className="text-2xl font-bold text-center mb-4">
              {currentRoom.name}
            </Text>
          }
          onEndReached={fetchPosts}
          onEndReachedThreshold={0.3}
        />
  
        {/* Simple Bottom Navbar */}
        <View className="absolute bottom-0 left-0 right-0 h-16 bg-white bright:bg-neutral-900 border-t border-gray-200 dark:border-gray-700 flex-row items-center justify-center">
          <Pressable
            onPress={handleCreatePost}
            className="px-6 py-2 bg-red-500 rounded-lg"
          >
            <Text className="text-white font-bold text-center">Create Post</Text>
          </Pressable>
        </View>
      </View>
    </Layout>
  );
  
  
}
