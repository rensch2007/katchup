import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import UserSearchInput from '../../src/components/rooms/UserSearchInput';
import { useRoom } from '../../src/store/roomContext';
import Layout from '../../src/components/Layout';
type User = {
  _id: string;
  username: string;
};

export default function CreateRoomScreen() {
  const { createRoom, inviteUsers, error, clearError } = useRoom();
  const [roomName, setRoomName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectUser = (user: User) => {
    setSelectedUsers((prev) => {
      // Check if already selected
      if (prev.some((u) => u._id === user._id)) {
        return prev;
      }
      return [...prev, user];
    });
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
  };

  const handleCreateRoom = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    clearError();
    
    try {
      // Create the room
      const room = await createRoom(roomName.trim());
      
      if (room) {
        // If users were selected, invite them
        if (selectedUsers.length > 0) {
          const inviteResult = await inviteUsers(
            room._id,
            selectedUsers.map((user) => user.username)
          );
          
          if (inviteResult) {
            // Navigate directly to the created room
            router.replace(`/(app)/room/${room._id}`);
          } else {
            // Room created but invitations failed
            Alert.alert(
              'Partial Success',
              'Room created successfully, but we could not send invitations.',
              [{ text: 'OK', onPress: () => router.replace(`/(app)/room/${room._id}`) }]
            );
          }
        } else {
          // No users to invite, navigate directly to room
          router.replace(`/(app)/room/${room._id}`);
        }
      }
    } catch (err) {
      console.error('Create room error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-center mb-6">Create a Room</Text>
        
        {/* Room Name Input */}
        <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <Text className="text-gray-600 mb-2">Room Name (Optional)</Text>
          <TextInput
            className="bg-gray-100 p-3 rounded-lg"
            placeholder="Enter room name or leave empty for random name"
            value={roomName}
            onChangeText={setRoomName}
          />
        </View>
        
        {/* User Search */}
        <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <Text className="text-gray-600 mb-2 text-base font-medium">Invite Users</Text>
          <UserSearchInput
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onRemoveUser={handleRemoveUser}
          />
        </View>
        
        {error && (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        )}
        
        {/* Create Button */}
        <Pressable
          className={`bg-red-500 p-4 rounded-lg ${isCreating ? 'opacity-70' : ''}`}
          onPress={handleCreateRoom}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Create Room
            </Text>
          )}
        </Pressable>
        
        {/* Cancel Button */}
        <Pressable
          className="mt-4 p-4"
          onPress={() => router.back()}
          disabled={isCreating}
        >
          <Text className="text-gray-500 text-center">Cancel</Text>
        </Pressable>
      </ScrollView>
    </Layout>
  );
}