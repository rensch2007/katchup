// components/LocationPicker.tsx

import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (location: LocationData) => void;
}

export default function LocationPicker({ visible, onClose, onSave }: LocationPickerProps) {
  const [region, setRegion] = useState<Region | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const place = geocode[0];
        setAddress(`${place.name || ''} ${place.city || ''} ${place.region || ''}`.trim());
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      await fetchAddress(latitude, longitude);
      setLoading(false);
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    await fetchAddress(newRegion.latitude, newRegion.longitude);
  };

  const handleSave = () => {
    if (region && address) {
      onSave({
        latitude: region.latitude,
        longitude: region.longitude,
        address,
      });
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-4 border-b">
          <Text className="text-lg font-semibold">Select Location</Text>
          <Pressable onPress={onClose}>
            <Text className="text-red-500 font-semibold">Cancel</Text>
          </Pressable>
        </View>

        {loading || !region ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4B5563" />
            <Text className="text-gray-500 mt-2">Fetching your location...</Text>
          </View>
        ) : (
          <>
            {Platform.OS !== 'web' ? (
  <MapView
    style={{ flex: 1 }}
    region={region}
    onRegionChange={handleRegionChange}
    onRegionChangeComplete={handleRegionChangeComplete}
  >
    <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
  </MapView>
) : (
  <View className="flex-1 items-center justify-center">
    <Text className="text-gray-400">Map is not available on web.</Text>
  </View>
)}


            <View className="p-4 border-t">
              <Text className="text-gray-500 text-sm mb-2">Selected Location:</Text>
              <TextInput
                value={address}
                editable={false}
                className="border p-3 rounded text-base bg-gray-100"
              />

              <Pressable
                onPress={handleSave}
                className="bg-green-600 mt-4 p-4 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Save Location</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
