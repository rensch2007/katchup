import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Room } from '../../store/roomContext';

type RoomCardProps = {
  room: Room;
  onPress?: () => void;
};

const RoomCard: React.FC<RoomCardProps> = ({ room, onPress }) => {
  const memberCount = room.members ? room.members.length : 0;
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Use the correct path format
      router.push(`/(app)/room/${room._id}`);
    }
  };
  
  return (
    <Pressable
      className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      onPress={handlePress}
    >
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800">{room.name}</Text>
        
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