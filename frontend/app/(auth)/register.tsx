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
import { useAuth } from '../../src/store/authContext';

export default function RegisterScreen() {
  const { register, error, clearError, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await register(username, email, password);
      
      // If registration is successful, useAuth will update the user state
      // and automatically redirect to the main app
      router.replace('/');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-red-600 text-center mb-10 mt-10">
          Katchup
        </Text>

        <View className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <Text className="text-2xl font-bold text-center mb-6">Register</Text>

          {error && (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          )}

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Username</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Email</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Password</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-600 mb-2">Confirm Password</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            className={`bg-red-500 p-4 rounded-lg ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Register
              </Text>
            )}
          </Pressable>
        </View>

        <Pressable className="p-2" onPress={goToLogin}>
          <Text className="text-gray-600 text-center">
            Already have an account?{' '}
            <Text className="text-red-500 font-bold">Login</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}