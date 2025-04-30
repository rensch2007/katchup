// File: components/Sidebar.tsx
import { useEffect } from 'react';
import { View, Text, Pressable, Animated,Alert, } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '../../src/store/authContext';
export default function Sidebar({ isOpen, onClose, slideAnim }: { isOpen: boolean; onClose: () => void; slideAnim: Animated.Value }) {
  const router = useRouter();
const { user, token, logout } = useAuth();
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? -260 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);
const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Something went wrong during logout');
    }
  };
  return (
    <View
      style={{
        width: 200,
        backgroundColor: 'white',
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: -2, height: 0 },
        shadowRadius: 8,
        elevation: 5,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        height: '100%',
      }}
    >
      <Pressable onPress={onClose} style={{ position: 'absolute', top: 12, right: 12, zIndex: 51 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>✕</Text>
      </Pressable>
      <View style={{ marginTop: 48 }}>
      <Pressable style={{ paddingVertical: 12 }} onPress={() => { onClose(); router.push('/'); }}>
          <Text style={{ fontSize: 16 }}>Home</Text>
        </Pressable>
        <Pressable style={{ paddingVertical: 12 }} onPress={() => { onClose(); router.push('/(app)/profile'); }}>
          <Text style={{ fontSize: 16 }}>Profile</Text>
        </Pressable>
        <Pressable style={{ paddingVertical: 12 }} onPress={() => { onClose(); router.push('/(app)/select-room'); }}>
          <Text style={{ fontSize: 16 }}>Select Room</Text>
        </Pressable>
        <Pressable style={{ paddingVertical: 12 }} onPress={() => { onClose(); router.push('/(app)/room-settings'); }}>
          <Text style={{ fontSize: 16 }}>Room Settings</Text>
        </Pressable>
        <Pressable style={{ paddingVertical: 12 }} onPress={() => { onClose(); handleLogout(); }}>
          <Text style={{ fontSize: 16 }}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}