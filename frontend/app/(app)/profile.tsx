import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/store/authContext';

const ProfilePage = () => {
  const { user, fetchUserData, userLoaded, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', profileImage: '', password: '', currentPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!userLoaded) fetchUserData();
    if (user) {
      setForm({
        ...form,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded, user]);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(form);
      setSuccess('Profile updated!');
      setEditMode(false);
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold mb-4">My Profile</Text>
      {loading && <ActivityIndicator />}
      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}
      {success ? <Text className="text-green-500 mb-2">{success}</Text> : null}
      {!editMode ? (
        <View className="items-center">
          <Image
            source={{ uri: user?.profileImage || 'https://placehold.co/100x100?text=No+Image' }}
            className="w-24 h-24 rounded-full mb-2"
          />
          <Text className="font-semibold">{user?.username}</Text>
          <Text className="text-gray-500 mb-4">{user?.email}</Text>
          <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded" onPress={() => setEditMode(true)}>
            <Text className="text-white">Edit Info</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="w-full">
          <Text>Username</Text>
          <TextInput
            value={form.username}
            onChangeText={v => handleChange('username', v)}
            className="border rounded px-2 py-1 mb-2"
          />
          <Text>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            className="border rounded px-2 py-1 mb-2"
          />
          <Text>Profile Image URL</Text>
          <TextInput
            value={form.profileImage}
            onChangeText={v => handleChange('profileImage', v)}
            className="border rounded px-2 py-1 mb-2"
          />
          <Text>New Password</Text>
          <TextInput
            value={form.password}
            onChangeText={v => handleChange('password', v)}
            secureTextEntry
            className="border rounded px-2 py-1 mb-2"
          />
          <Text>Current Password (required to change password)</Text>
          <TextInput
            value={form.currentPassword}
            onChangeText={v => handleChange('currentPassword', v)}
            secureTextEntry
            className="border rounded px-2 py-1 mb-2"
          />
          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity className="bg-green-500 flex-1 px-4 py-2 rounded" onPress={handleSubmit} disabled={loading}>
              <Text className="text-white text-center">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-400 flex-1 px-4 py-2 rounded" onPress={() => setEditMode(false)}>
              <Text className="text-white text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfilePage;
