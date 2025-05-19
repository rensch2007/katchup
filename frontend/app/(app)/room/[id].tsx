import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Pressable,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useRoom } from '../../../src/store/roomContext';
import { useAuth } from '../../../src/store/authContext';
import Layout from '../../../src/components/Layout';
import PostCard from '../../../src/components/PostCard';
import { BASE_URL } from '../../../src/config';

import TamagotchiPreview from '../../../src/components/tamagotchi/TamagotchiPreview';
import FooterNavBar from '../../../src/components/Footer'; 
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const getStreakEmoji = (count: number) => {
    if (count >= 7) return '🍅🔥💥';
    if (count >= 5) return '🍅🍅';
    if (count >= 3) return '🍅';
    if (count >= 2) return '🌿';
    return '🌱';
  };

  const getNextStageTarget = (streak: number) => {
    if (streak < 2) return 2;
    if (streak < 5) return 5;
    if (streak < 7) return 7;
    return null; // fully evolved
  };


  const [postedUserIds, setPostedUserIds] = useState<string[]>([]);
  const [allMemberIds, setAllMemberIds] = useState<string[]>([]);
  const [youPostedToday, setYouPostedToday] = useState(false);

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

  const fetchPosts = async (reset = false) => {
    if (!token || !id || isFetchingPosts) return;

    try {
      setIsFetchingPosts(true);
      const currentPage = reset ? 1 : page;

      const res = await fetch(`${BASE_URL}/posts/room/${id}?page=${currentPage}&limit=${PAGE_SIZE}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (json.success) {
        const newPosts = json.data;

        setPosts(prev => {
          const combined = reset ? newPosts : [...prev, ...newPosts];
          const unique = Array.from(new Map(combined.map(p => [p._id, p])).values());
          return unique;
        });

        setHasMore(newPosts.length === PAGE_SIZE);
        setPage(reset ? 2 : currentPage + 1);
      } else {
        console.warn('Failed to fetch posts:', json.message);
      }
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  const handleCreatePost = () => {
    router.push('/(app)/create-post');
  };

  const fetchStreakStatus = async () => {
    if (!token || !id) return;

    try {
      const res = await fetch(`${BASE_URL}/rooms/${id}/streak-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success) {
        setPostedUserIds(json.postedUserIds);
        setAllMemberIds(json.allMemberIds);
        setYouPostedToday(json.youPostedToday);
      }
    } catch (err) {
      console.error('Error fetching streak status:', err);
    }
  };

  useEffect(() => {
    fetchPosts(true);
    fetchStreakStatus();
  }, [id]);

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
          refreshing={isFetchingPosts}
          onRefresh={() => {
            setPage(1);
            fetchPosts(true);
          }}
          onEndReached={() => {
            if (hasMore && !isFetchingPosts) {
              fetchPosts();
            }
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View className="items-center mb-4 space-y-2">


              {/* Tamagotchi + Progress Row */}
              <View className="flex-row items-center w-full max-w-md justify-between px-4 mt-1">
                {/* Current Tamagotchi Preview (clickable) */}
                <View className="items-center justify-center">
                  <TamagotchiPreview streak={currentRoom.collectiveStreakCount ?? 0} />
                </View>

                {/* Progress Bar + Stats */}
                <View className="flex-1 mx-3 items-center">
                  <Text className="text-base font-semibold text-gray-700 mb-1">
                    {getStreakEmoji(currentRoom.collectiveStreakCount ?? 0)}{' '}
                    {currentRoom.collectiveStreakCount ?? 0}-day streak
                  </Text>

                  <View className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <View
                      className="bg-red-400 h-full rounded-full"
                      style={{
                        width: `${((currentRoom.collectiveStreakCount ?? 0) /
                          (getNextStageTarget(currentRoom.collectiveStreakCount ?? 1) ?? 1)) * 100
                          }%`,
                      }}
                    />
                  </View>

                  <Text className="text-xs text-gray-500">
                    {postedUserIds.length} / {allMemberIds.length} members have posted
                  </Text>
                  <Text className="text-sm text-red-500 font-medium">
                    {youPostedToday ? '✅ You’ve posted today!' : '❗ You haven’t posted yet today'}
                  </Text>
                </View>

                {/* Next Stage Tamagotchi (blurred) */}
                <View className="items-center justify-center">
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={require('../../../assets/tamagotchi/sprout.png')}
                      style={{ width: 65, height: 65, opacity: 0.2 }}
                    />
                    <View className="absolute w-11 h-11 rounded-full bg-white/40 top-0 left-0" />
                  </View>
                </View>
              </View>

            </View>
          }


          ListFooterComponent={
            isFetchingPosts && posts.length > 0 ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#ef4444" />
              </View>
            ) : null
          }
        />

        {/* Bottom Create Post Bar */}
        <FooterNavBar />

      </View>
    </Layout>
  );
}
