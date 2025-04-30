import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/store/authContext';

export default function LoginScreen() {
  const { login, error, clearError, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    console.log('Attempting login with:', { username, password: '****' });
    
    try {
      await login(username, password);
      
      // Login function will handle state updates and navigation
    } catch (err) {
      console.error('Login submission error:', err);
    }
  };

  const goToRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-6 flex-1 justify-center">
        <Text className="text-3xl font-bold text-red-600 text-center mb-10">
          katchup
        </Text>

        <View className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <Text className="text-2xl font-bold text-center mb-6">Login</Text>

          {error && (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          )}

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Username</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-600 mb-2">Password</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            className={`bg-red-500 p-4 rounded-lg ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Login
              </Text>
            )}
          </Pressable>
        </View>

        <Pressable className="p-2" onPress={goToRegister}>
          <Text className="text-gray-600 text-center">
            Don't have an account?{' '}
            <Text className="text-red-500 font-bold">Register</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}