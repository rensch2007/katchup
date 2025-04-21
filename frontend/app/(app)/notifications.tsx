import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useNotification } from '../../src/store/notificationContext';
import InvitationItem from '../../src/components/rooms/InvitationItem';

export default function NotificationsScreen() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    error,
  } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleAcceptInvitation = async (notificationId: string) => {
    await markAsRead(notificationId);
    await deleteNotification(notificationId);
    fetchNotifications();
  };

  const handleDeclineInvitation = async (notificationId: string) => {
    await markAsRead(notificationId);
    await deleteNotification(notificationId);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      Alert.alert('Success', 'All notifications marked as read');
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'room_invitation') {
      return (
        <InvitationItem
          notification={item}
          onAccept={() => handleAcceptInvitation(item._id)}
          onDecline={() => handleDeclineInvitation(item._id)}
        />
      );
    }

    // Regular notification
    return (
      <Pressable
        className={`p-4 mb-3 rounded-lg border-l-4 ${
          item.read ? 'bg-gray-100 border-gray-300' : 'bg-white border-red-500'
        }`}
        onPress={() => markAsRead(item._id)}
      >
        <Text className="text-gray-800">{item.message}</Text>
        <Text className="text-gray-500 text-xs mt-2">
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-1">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold">Notifications</Text>
          {notifications.length > 0 && (
            <Pressable onPress={handleMarkAllAsRead}>
              <Text className="text-red-500">Mark all as read</Text>
            </Pressable>
          )}
        </View>

        {error && <Text className="text-red-500 mb-4">{error}</Text>}

        {isLoading && notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#ef4444" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">No notifications</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
            }
          />
        )}

        <Pressable
          className="mt-4 p-4"
          
          onPress={() => router.push(`/(auth)/login`)}
        >
          <Text className="text-gray-500 text-center">Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}