import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setAuth(data.token, data.user);
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-3xl font-bold text-red-600 mb-8">Create Account</Text>
        
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Username</Text>
          <TextInput
            className="bg-white p-4 rounded-lg border border-gray-200"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Email</Text>
          <TextInput
            className="bg-white p-4 rounded-lg border border-gray-200"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Password</Text>
          <TextInput
            className="bg-white p-4 rounded-lg border border-gray-200"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          className={`bg-red-600 p-4 rounded-lg ${loading ? 'opacity-70' : ''}`}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">Sign Up</Text>
          )}
        </Pressable>

        <Pressable 
          className="mt-4"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-center text-gray-600">
            Already have an account? <Text className="text-red-600 font-bold">Login</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}