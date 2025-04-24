import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Pressable,
  Share,
  Alert,
  FlatList,
  Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useRoom } from '../../../src/store/roomContext';
import { useAuth } from '../../../src/store/authContext';
import UserSearchInput from '../../../src/components/rooms/UserSearchInput';
import * as Clipboard from 'expo-clipboard';
import { useNotification } from '../../../src/store/notificationContext';

type User = {
  _id: string;
  username: string;
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token, logout } = useAuth();
  const { rooms, currentRoom, fetchRoom, isLoading, isLoading: roomsLoading, inviteUsers, error, clearError } = useRoom();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { unreadCount } = useNotification();
  useEffect(() => {
    const loadRoomData = async () => {
      if (!id) {
        setLoadingError('Room ID is missing');
        setLocalLoading(false);
        return;
      }

      if (!token) {
        console.log('Token not ready yet. Waiting to fetch room...');
        return; // 👈 WAIT until token exists
      }

      try {
        console.log('Fetching room with ID:', id);
        await fetchRoom(id);
        console.log('Room fetch completed');
      } catch (err) {
        console.error('Error fetching room:', err);
        setLoadingError('Failed to load room details');
      } finally {
        setLocalLoading(false);
      }
    };

    loadRoomData();
  }, [id, token]); // 👈 depend on BOTH id and token


  const goToNotifications = () => {
    router.push('/(app)/notifications');
  };

  const handleCreateRoom = () => {
    router.push('/(app)/create-room');
  };

  const handleSelectRoom = () => {
    router.push('/(app)/select-room');
  };

  const handleJoinRoom = () => {
    router.push('/(app)/join-room');
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Something went wrong during logout');
    }
  };

  const handleProfile = () => {
    router.push('/(app)/profile');
  };

  const getMemberUsername = (member: any) => {
    if (!member) return 'Unknown';

    if (typeof member === 'string') {
      return 'User';  // We only have the ID
    }

    if (member._id) {
      return member.username || 'Unnamed';
    }

    return 'Unknown';
  };

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => {
      if (prev.some(u => u._id === user._id)) {
        return prev;
      }
      return [...prev, user];
    });
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user._id !== userId));
  };

  const handleInviteUsers = async () => {
    if (!currentRoom || isInviting || selectedUsers.length === 0) return;

    setIsInviting(true);
    clearError();

    try {
      const result = await inviteUsers(
        currentRoom._id,
        selectedUsers.map(user => user.username)
      );

      if (result) {
        const { invited, invalid } = result;

        let message = `${invited.length} ${invited.length === 1 ? 'user' : 'users'
          } invited successfully.`;

        if (invalid.length > 0) {
          message += ` ${invalid.length} ${invalid.length === 1 ? 'invitation' : 'invitations'
            } could not be sent.`;
        }

        Alert.alert('Success', message);
        setSelectedUsers([]);
        setShowInviteForm(false);
      }
    } catch (err) {
      console.error('Invite users error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleShareRoomCode = async () => {
    if (!currentRoom) return;

    try {
      await Clipboard.setStringAsync(currentRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error('Clipboard copy error:', error);
    }
  };



  // Show loading state while fetching data
  if (localLoading || isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-4 text-gray-500">Loading room...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
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

    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* App Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-end">
            <Text className="text-3xl font-bold text-red-600">katchup</Text>
            <Image
              source={require('../../../assets/images/katchup_bottle_slim_only.png')}
              style={{
                width: 30,
                height: 34,
                marginLeft: -7,
                marginBottom: 1,
              }}
              resizeMode="contain"
            />
          </View>


          {user && (
            <View className="flex-row space-x-2">
              <Pressable
                onPress={goToNotifications}
                className="relative"
              >
                <View className="p-2">
                  <Text className="text-lg">🔔</Text>
                </View>
                {unreadCount > 0 && (
                  <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={handleProfile}
                className="bg-gray-100 flex-1 justify-center text-center px-4 py-0 rounded-lg"
              >
                <Text>Profile</Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                className="bg-gray-100 flex-1 justify-center text-center px-4 py-0 rounded-lg"
              >
                <Text>Logout</Text>
              </Pressable>
            </View>
          )}
        </View>
        <Text className="text-2xl font-bold text-center mb-2">{currentRoom.name}</Text>
        <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-600">Room Code</Text>
            <Text className="font-bold">{currentRoom.code}</Text>
          </View>

          <Pressable
            className="bg-blue-500 p-3 rounded-lg"
            onPress={handleShareRoomCode}
          >
            <Text className="text-white text-center font-medium">Share Room Code</Text>
          </Pressable>
          {copied && (
            <Text className="text-green-500 text-center mt-2">
              Room code copied to clipboard!
            </Text>
          )}
        </View>

        {/* Members List */}
        <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <Text className="text-gray-800 font-medium text-lg mb-3">
            Members ({currentRoom.members?.length || 0})
          </Text>

          {currentRoom.members && currentRoom.members.length > 0 ? (
            currentRoom.members.map((member, index) => (
              <View
                key={`member-${index}`}
                className="flex-row justify-between py-2 border-b border-gray-100"
              >
                <Text className="text-gray-800">{getMemberUsername(member)}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 italic">No members found</Text>
          )}
        </View>

        {/* Pending Invitations */}
        {currentRoom.invitations && currentRoom.invitations.filter(inv => inv.status === 'pending').length > 0 && (
          <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <Text className="text-gray-800 font-medium text-lg mb-3">
              Pending Invitations (
              {currentRoom.invitations.filter(inv => inv.status === 'pending').length}
              )
            </Text>

            {currentRoom.invitations.filter(inv => inv.status === 'pending').map((invitation, index) => {
              const inviteeName = typeof invitation.user === 'string'
                ? 'User'
                : invitation.user.username || 'Unnamed';

              return (
                <View
                  key={`invitation-${index}`}
                  className="flex-row justify-between py-2 border-b border-gray-100"
                >
                  <Text className="text-gray-800">{inviteeName}</Text>
                  <Text className="text-amber-500">Pending</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Invite Users Form */}
        {!showInviteForm ? (
          <View className="flex-row justify-end space-x-2 mt-4">
            <Pressable
              className="bg-red-500 p-4 rounded-lg mb-4"
              onPress={() => setShowInviteForm(true)}
            >
              <Text className="text-white text-center font-bold">
                Invite Users
              </Text>
            </Pressable>
            <Pressable
              className="bg-red-500 p-4 rounded-lg mb-4"
              onPress={handleSelectRoom}
            >
              <Text className="text-white text-center font-bold">
                Select Room
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <Text className="text-gray-800 font-medium text-lg mb-3">
              Invite Users
            </Text>

            <UserSearchInput
              selectedUsers={selectedUsers}
              onSelectUser={handleSelectUser}
              onRemoveUser={handleRemoveUser}
            />

            {error && (
              <Text className="text-red-500 mb-4">{error}</Text>
            )}

            <View className="flex-row justify-end space-x-3 mt-4">
              <Pressable
                className="bg-gray-200 px-4 py-2 rounded-lg"
                onPress={() => {
                  setShowInviteForm(false);
                  setSelectedUsers([]);
                }}
                disabled={isInviting}
              >
                <Text className="text-gray-700">Cancel</Text>
              </Pressable>

              <Pressable
                className={`bg-red-500 px-4 py-2 rounded-lg ${isInviting || selectedUsers.length === 0 ? 'opacity-50' : ''
                  }`}
                onPress={handleInviteUsers}
                disabled={isInviting || selectedUsers.length === 0}
              >
                {isInviting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white">Send Invites</Text>
                )}
              </Pressable>

            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}