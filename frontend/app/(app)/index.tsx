// Update this file: frontend/app/(app)/index.tsx

import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import LogoutButton from '../../src/components/LogoutButton';

interface ConnectionStatus {
  status: string;
  database: string;
  error: string | null;
}

export default function Index() {
  const user = useAuthStore((state) => state.user);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'Checking...',
    database: 'Checking...',
    error: null
  });
  const [loading, setLoading] = useState(true);

  const checkBackend = async () => {
    setLoading(true);
    setConnectionStatus({ status: 'Checking...', database: 'Checking...', error: null });

    try {
      const response = await fetch('http://localhost:5001/api/health');
      const data = await response.json();
      
      setConnectionStatus({
        status: data.status,
        database: data.dbConnection,
        error: null
      });
    } catch (error) {
      setConnectionStatus({
        status: 'offline',
        database: 'disconnected',
        error: 'Cannot connect to backend'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-6">
        {/* Welcome Message */}
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {user?.username}!
        </Text>
        
        {/* App Title */}
        <Text className="text-4xl font-bold text-red-600 mb-8">
          Katchup
        </Text>
        
        {/* Status Card */}
        <View className="bg-white rounded-xl shadow-lg w-full p-6 mb-6">
          <Text className="text-xl font-semibold mb-4 text-center">
            Backend Status
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#ef4444" />
          ) : (
            <>
              <View className="flex-row justify-between mb-3 pb-2 border-b border-gray-200">
                <Text className="text-gray-600">Server:</Text>
                <Text className={`font-bold ${
                  connectionStatus.status === 'ok' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {connectionStatus.status}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-600">Database:</Text>
                <Text className={`font-bold ${
                  connectionStatus.database === 'connected' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {connectionStatus.database}
                </Text>
              </View>
              
              {connectionStatus.error && (
                <Text className="text-red-500 text-center mt-2">
                  {connectionStatus.error}
                </Text>
              )}
            </>
          )}
        </View>
        
        {/* Check Button */}
        <Pressable 
          className={`bg-blue-300 w-full p-4 rounded-lg ${loading ? 'opacity-50' : ''}`}
          onPress={checkBackend}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Checking...' : 'Check Connection'}
          </Text>
        </Pressable>

        {/* Logout Button */}
        <LogoutButton />
      </View>
    </SafeAreaView>
  );
}