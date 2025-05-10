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
import { BASE_URL } from '../../../src/config';

type Post = {
  _id: string;
  text: string;
  images?: string[];
  location?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  } | string;
  roomId: string;
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const {
    currentRoom,
    fetchRoom,
    isLoading,
    error,
  } = useRoom();

  const [localLoading, setLocalLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);

  // Fetch room details
  useEffect(() => {
    const loadRoomData = async () => {
      if (!id || !token) {
        setLoadingError('Room ID or token missing');
        setLocalLoading(false);
        return;
      }

      try {
        await fetchRoom(id);
      } catch (err) {
        console.error('Error fetching room:', err);
        setLoadingError('Failed to load room details');
      } finally {
        setLocalLoading(false);
      }
    };

    loadRoomData();
  }, [id, token]);

  // Fetch posts by roomId
  const fetchPosts = async () => {
    if (!token || !id || isFetchingPosts) return;

    try {
      setIsFetchingPosts(true);
      const res = await fetch(`${BASE_URL}/posts/room/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
      } else {
        console.warn('Failed to fetch posts:', json.message);
      }
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [id]);

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
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListHeaderComponent={
            <Text className="text-2xl font-bold text-center mb-4">
              {currentRoom.name}
            </Text>
          }
          refreshing={isFetchingPosts}
          onRefresh={fetchPosts}
        />

        {/* Bottom Create Post Bar */}
        <View className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex-row items-center justify-center">
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
