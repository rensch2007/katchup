import React from 'react';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

const ProfileButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="bg-gray-200 px-4 py-2 rounded items-center"
      onPress={() => router.push('/(app)/profile')}
    >
      <Text className="text-gray-700">My Profile</Text>
    </TouchableOpacity>
  );
};

export default ProfileButton;
