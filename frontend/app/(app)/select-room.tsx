import React, { useState, useEffect, useMemo } from 'react';
import {
    Text,
    View,
    Pressable,
    ActivityIndicator,
    SafeAreaView,
    FlatList,
    Alert,
    Image
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/store/authContext';
import { useRoom } from '../../src/store/roomContext';
import { useNotification } from '../..//src/store/notificationContext';
import RoomCard from '../../src/components/rooms/RoomCard';

export default function Index() {
    const { user, token, logout, defaultRoom } = useAuth();
    const { rooms, fetchRooms, isLoading: roomsLoading } = useRoom();
    const { unreadCount } = useNotification();
    const [loading, setLoading] = useState(true);
    const [backendStatus, setBackendStatus] = useState({
        status: 'Checking...',
        database: 'Checking...',
        error: null as string | null
    });



    useEffect(() => {
        if (token) {
            fetchRooms();
        }
    }, [token]);

    const handleCreateRoom = () => {
        router.push('/(app)/create-room');
    };

    const handleJoinRoom = () => {
        router.push('/(app)/join-room');
    };

    const sortedRooms = useMemo(() => {
        if (!rooms) return [];
      
        return [...rooms].sort((a, b) => {
          if (a._id === defaultRoom) return -1;
          if (b._id === defaultRoom) return 1;
          return 0;
        });
      }, [rooms, defaultRoom]);

    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('Success', 'You have been logged out');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Something went wrong during logout');
        }
    };

    const goToNotifications = () => {
        router.push('/(app)/notifications');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 p-4">
                {/* App Header */}
                <View className="flex-row items-end">
                    <Text className="text-3xl font-bold text-red-600">katchup</Text>
                    <Image
                        source={require('../../assets/images/katchup_bottle_slim_only.png')}
                        style={{
                            width: 30,
                            height: 34,
                            marginLeft: -7,
                            marginBottom: 1,
                        }}
                        resizeMode="contain"
                    />
                </View>


                {/* Rooms List or Login/Create/Join Options */}
                {user && token ? (
                    roomsLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#ef4444" />
                        </View>
                    ) : rooms.length > 0 ? (
                        <>
                            <View className="flex-row space-x-2 mt-4 mb-5">
                                <Pressable
                                    className="bg-red-500 p-3 rounded-lg flex-1"
                                    onPress={handleCreateRoom}
                                >
                                    <Text className="text-white text-center font-medium">
                                        Create Room
                                    </Text>
                                </Pressable>
                                <Pressable
                                    className="bg-blue-500 p-3 rounded-lg flex-1"
                                    onPress={handleJoinRoom}
                                >
                                    <Text className="text-white text-center font-medium">
                                        Join Room
                                    </Text>
                                </Pressable>
                            </View>
                            <Text className="text-xl font-bold mb-4">Your Rooms</Text>
                            <View className='max-h-[70%]'>
                                <FlatList
                                    data={sortedRooms}
                                    keyExtractor={(item) => item._id}
                                    renderItem={({ item }) => (
                                        <RoomCard
                                            room={item}
                                            onPress={() => router.push(`/(app)/room/${item._id}`)}
                                        />
                                    )}
                                />
                            </View>


                        </>
                    ) : (
                        <View className="flex-1 justify-center">
                            <Text className="text-center text-gray-500 mb-6">
                                You are not a member of any rooms yet
                            </Text>
                            <Pressable
                                className="bg-red-500 p-4 rounded-lg mb-4"
                                onPress={handleCreateRoom}
                            >
                                <Text className="text-white text-center font-bold text-lg">
                                    Create a Room
                                </Text>
                            </Pressable>
                            <Pressable
                                className="bg-blue-500 p-4 rounded-lg"
                                onPress={handleJoinRoom}
                            >
                                <Text className="text-white text-center font-bold text-lg">
                                    Join a Room
                                </Text>
                            </Pressable>
                        </View>
                    )
                ) : (
                    <View className="flex-1 justify-center">
                        <Text className="text-center text-gray-500 mb-6">
                            You need to be logged in to create or join rooms
                        </Text>
                        <Pressable
                            className="bg-red-500 p-4 rounded-lg"
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                Login
                            </Text>
                        </Pressable>
                    </View>
                )}

            </View>
        </SafeAreaView>
    );
}