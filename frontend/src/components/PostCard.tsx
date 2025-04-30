import React from 'react';
import { View, Text, Image } from 'react-native';

export default function PostCard() {
  return (
    <View className="bg-white rounded-2xl shadow-md p-4 mb-4">
      {/* Header - user and date */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-gray-300  mr-3" />
          <Text className="text-base font-semibold text-black dark:text-white">Username</Text>
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">Date</Text>
      </View>

      {/* Media placeholder */}
      <View className="w-full h-52 bg-gray-200  rounded-xl mb-3" />

      {/* Content placeholder */}
      <Text className="text-sm text-gray-800 dark:text-gray-200 mb-2">
        Post content goes here...
      </Text>

      {/* Reactions and comments (optional for now) */}
      <View className="flex-row justify-between mt-2">
        <Text className="text-sm text-gray-500 dark:text-gray-400">💬 0 Comments</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">❤️ 0 Likes</Text>
      </View>
    </View>
  );
}
