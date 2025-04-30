import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useRoom } from '../../src/store/roomContext';
import Layout from '../../src/components/Layout';
export default function JoinRoomScreen() {
  const { joinRoom, error, clearError } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }
    
    setIsJoining(true);
    clearError();
    
    try {
      const room = await joinRoom(roomCode.trim());
console.log('Room after joinRoom:', room); // 👈 NEW LOG

if (room) {
  console.log('Showing success alert'); // 👈 NEW LOG
  alert(`You have joined ${room.name} successfully!`);

  Alert.alert('Success', `You have joined ${room.name} successfully!`, [
    { text: 'OK', onPress: () => router.replace('/') },
  ]);
} 

    } catch (err) {
      console.error('Join room error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Layout>
       <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-center mb-6">Join a Room</Text>
        
        {/* Room Code Input */}
        <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <Text className="text-gray-600 mb-2">Room Code</Text>
          <TextInput
            className="bg-gray-100 p-3 rounded-lg"
            placeholder="Enter room code"
            value={roomCode}
            onChangeText={setRoomCode}
            autoCapitalize="characters"
          />
        </View>
        
        {error && (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        )}
        
        {/* Join Button */}
        <Pressable
          className={`bg-red-500 p-4 rounded-lg ${isJoining ? 'opacity-70' : ''}`}
          onPress={handleJoinRoom}
          disabled={isJoining}
        >
          {isJoining ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Join Room
            </Text>
          )}
        </Pressable>
        
        {/* Cancel Button */}
        <Pressable
          className="mt-4 p-4"
          onPress={() => router.back()}
          disabled={isJoining}
        >
          <Text className="text-gray-500 text-center">Cancel</Text>
        </Pressable>
      </ScrollView>
    </Layout>
  );
}