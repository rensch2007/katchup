// app/(app)/create-post.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { MapView, Marker } from '../../src/components/SafeMapView/MapView';
import { LocateFixed } from 'lucide-react-native';
import { usePostContext } from '../../src/store/postContext';
import Constants from 'expo-constants';
import Layout from '../../src/components/Layout';

export default function CreatePost() {
  const router = useRouter();
  const [text, setText] = useState('');
  const { createPost, isLoading } = usePostContext();
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const GOOGLE_API_KEY = Constants.expoConfig?.extra?.googleApiKey;
  const mapRef = useRef<MapView | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission denied.');
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      };

      setRegion(newRegion);
      await fetchAddress(latitude, longitude);
      setLoadingLocation(false);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      const place = data?.results?.[0];
      if (place) {
        setLocation({ address: place.formatted_address, latitude, longitude });

        const firstComponent = place.address_components?.find((c: any) =>
          c.types.includes('point_of_interest') ||
          c.types.includes('establishment') ||
          c.types.includes('locality')
        );

        setSearchQuery(firstComponent?.short_name || place.formatted_address);
      }
    } catch (error) {
      console.error('Google Reverse Geocode error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0) {
      alert('Post cannot be empty.');
      return;
    }

    const success = await createPost({
      text,
      image: images,
      location: location ? `${location.address} (${location.latitude}, ${location.longitude})` : undefined
    });

    if (success) {
      setText('');
      setImages([]);
      setLocation(null);
      setRegion(null);
      setSearchQuery('');
      setSearchResults([]);
      router.push('/');
    } else {
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <Layout>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1 p-4" ref={scrollViewRef} keyboardShouldPersistTaps="handled">
            <Text className="text-2xl font-bold mb-4">Create Post</Text>

            <TextInput
              className="border rounded p-3 mb-4 h-32 text-base"
              multiline
              placeholder="What's on your mind?"
              placeholderTextColor="#808080"
              value={text}
              onChangeText={setText}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#f87171aa' : '#ef4444',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '600' }}>Post</Text>
              )}
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Layout>
  );
}