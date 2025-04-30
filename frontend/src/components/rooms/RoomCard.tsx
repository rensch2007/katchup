import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Room } from '../../store/roomContext';

import { useAuth } from '../../../src/store/authContext';
type RoomCardProps = {
  room: Room;
  onPress?: () => void;
};

const RoomCard: React.FC<RoomCardProps> = ({ room, onPress}) => {
  const memberCount = room.members ? room.members.length : 0;
  const { defaultRoom, updateDefaultRoom } = useAuth();

  const isDefault = room._id === defaultRoom;
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Use the correct path format
      router.push(`/(app)/room/${room._id}`);
    }
  };
  const handleStarPress = () => {
    if (!isDefault) {
      updateDefaultRoom(room._id); // Update state or backend
    }
  };

  return (
    <Pressable
      className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      onPress={handlePress}
    >
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-gray-800">{room.name}</Text>
          <Pressable onPress={handleStarPress} hitSlop={10}>
            <Text className="text-xl">{isDefault ? '⭐' : '☆'}</Text>
          </Pressable>
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-500">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Text>
          <Text className="text-gray-500">
            Room Code: {room.code}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default RoomCard;