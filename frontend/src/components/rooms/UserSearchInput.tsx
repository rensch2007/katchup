import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../store/authContext';
import { BASE_URL } from '../../config';
type User = {
  _id: string;
  username: string;
};

type UserSearchInputProps = {
  selectedUsers: User[];
  onSelectUser: (user: User) => void;
  onRemoveUser: (userId: string) => void;
};

const UserSearchInput: React.FC<UserSearchInputProps> = ({
  selectedUsers,
  onSelectUser,
  onRemoveUser,
}) => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !token) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}/auth/search?query=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setSearchResults(data.data);
        } else {
          setError(data.error || 'Failed to search users');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('User search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-600 mb-2">Search Users</Text>
      <TextInput
        className="bg-gray-100 p-3 rounded-lg mb-2"
        placeholder="Type username to search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View className="mt-2 mb-4">
          <Text className="text-gray-600 mb-2">Selected Users:</Text>
          <View className="flex-row flex-wrap">
            {selectedUsers.map((user) => (
              <View
                key={user._id}
                className="bg-red-100 rounded-full px-3 py-1 m-1 flex-row items-center"
              >
                <Text className="text-red-800 mr-1">{user.username}</Text>
                <TouchableOpacity onPress={() => onRemoveUser(user._id)}>
                  <Text className="text-red-800 font-bold">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Search Results */}
      {isSearching ? (
        <ActivityIndicator size="small" color="#ef4444" className="my-2" />
      ) : searchResults.length > 0 ? (
        <View className="border border-gray-200 rounded-lg">
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 border-b border-gray-200"
                onPress={() => handleSelectUser(item)}
                disabled={selectedUsers.some((u) => u._id === item._id)}
              >
                <Text
                  className={
                    selectedUsers.some((u) => u._id === item._id)
                      ? 'text-gray-400'
                      : 'text-gray-800'
                  }
                >
                  {item.username}
                  {selectedUsers.some((u) => u._id === item._id) && ' (Selected)'}
                </Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 150 }}
          />
        </View>
      ) : searchQuery.trim().length > 0 && !isSearching ? (
        <Text className="text-gray-500 py-2">No users found</Text>
      ) : null}

      {error && <Text className="text-red-500 mt-2">{error}</Text>}
    </View>
  );
};

export default UserSearchInput;