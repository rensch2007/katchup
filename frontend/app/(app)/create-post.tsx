// app/(app)/create-post.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, Image, ScrollView, FlatList, ActivityIndicator, Platform, TouchableOpacity, KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { MapView, Marker } from '../../src/components/SafeMapView/MapView';
import { LocateFixed } from 'lucide-react-native';
import { usePostContext } from '../../src/store/postContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import Layout from '../../src/components/Layout';
import { fetchMusicMetadata, MusicMetadata } from '../../src/store/musicContext';
import { useAuth } from '../../src/store/authContext';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AntDesign, Entypo } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import FooterNavBar from '@/src/components/Footer';



export default function CreatePost() {
  const router = useRouter();
  const { createPost } = usePostContext();
  const [text, setText] = useState('');
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const [musicUrl, setMusicUrl] = useState('');
  const [musicMetadata, setMusicMetadata] = useState<MusicMetadata | null>(null);
  const [musicError, setMusicError] = useState('');
  const captionRef = useRef<TextInput>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    if (!musicUrl) {
      setMusicMetadata(null);
      setMusicError('');
      return;
    }

    const loadMetadata = async () => {
      try {
        const metadata = await fetchMusicMetadata(musicUrl, token!);
        setMusicMetadata(metadata);
        setMusicError('');
      } catch (err: any) {
        setMusicMetadata(null);
        setMusicError(err.message);
      }
    };

    loadMetadata();
  }, [musicUrl]);


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
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      await fetchAddress(latitude, longitude);
      setLoadingLocation(false);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_API_KEY}&location=${region?.latitude ?? 37.7749},${region?.longitude ?? -122.4194}&radius=50000`
      );

      const data = await response.json();
      console.log('Search result:', data);

      if (data?.predictions) {
        setSearchResults(data.predictions);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Google Places search error:', error);
    }
  };


  const fetchPlaceDetails = async (placeId: string, description: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      const location = data?.result?.geometry?.location;
      const name = data?.result?.name || description; // fallback to description
      const address = data?.result?.formatted_address;

      if (location && name && address) {
        const { lat, lng } = location;

        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setLocation({
          address,
          latitude: lat,
          longitude: lng,
        });

        setSearchQuery(name); // ✅ here, no conflict anymore

        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Place details fetch error:', error);
    }
  };


  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    setRegion((prev) => ({
      ...prev!,
      latitude,
      longitude,
    }));

    await fetchAddress(latitude, longitude);
    setSearchResults([]);
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      console.log('Reverse Geocode Result:', data);

      const place = data?.results?.[0];

      if (place) {
        setLocation({
          address: place.formatted_address,
          latitude,
          longitude,
        });

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



  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10 - images.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      const processedUris: string[] = [];

      for (const asset of result.assets) {
        const sizeInMB = (asset.fileSize ?? 0) / (1024 * 1024);

        if (sizeInMB <= 30) {
          processedUris.push(asset.uri);
        } else {
          const manipulated = await ImageManipulator.manipulateAsync(
            asset.uri,
            [],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          processedUris.push(manipulated.uri);
        }
      }

      setImages((prev) => [...prev, ...processedUris]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0) {
      alert('Post cannot be empty.');
      return;
    }

    setIsSubmitting(true); // ⬅️ Start spinner

    try {
      const payload = {
        text,
        image: images,
        location: location
          ? `${location.address} (${location.latitude}, ${location.longitude})`
          : undefined,
        ...(musicMetadata && {
          musicPlatform: musicMetadata.platform,
          musicTrackId: musicMetadata.trackId,
          musicTitle: musicMetadata.title,
          musicArtist: musicMetadata.artist,
          musicAlbumCover: musicMetadata.albumCover,
          musicPreviewUrl: musicMetadata.previewUrl,
        }),
      };

      console.log('[createPost payload]', payload);

      const success = await createPost(payload);

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
    } catch (err) {
      console.error('[handleSubmit] Error:', err);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false); // ⬅️ Stop spinner
    }
  };






  return (
    <Layout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1 p-4" ref={scrollViewRef} keyboardShouldPersistTaps="handled">
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-sm text-gray-500">
                ✍️ <Text className="font-semibold text-gray-600">New Post</Text>
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>


            {/* Image Picker */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-2">🖼️ Images</Text>

              <DraggableFlatList
                data={[...images, ...(images.length < 10 ? ['add'] : [])]}
                onDragEnd={({ data }) => {
                  // Filter out the 'add' slot before updating
                  const filtered = data.filter((item) => item !== 'add');
                  setImages(filtered as string[]);
                }}
                keyExtractor={(item, index) => `${item}-${index}`}
                horizontal
                contentContainerStyle={{ paddingVertical: 12 }}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, drag, isActive }: RenderItemParams<string | 'add'>) => {
                  if (item === 'add') {
                    return (
                      <Pressable
                        onPress={pickImages}
                        className="w-24 h-24 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300 ml-2"
                      >
                        <Text className="text-3xl text-gray-400">+</Text>
                      </Pressable>
                    );
                  }

                  return (
                    <Pressable
                      onLongPress={drag}
                      onPress={() => setPreviewIndex(images.indexOf(item))}

                      disabled={isActive}
                      className="relative mr-3"
                    >
                      <Image
                        source={{ uri: item }}
                        className="w-24 h-24 rounded-xl"
                        resizeMode="cover"
                      />
                      <Pressable
                        onPress={() => removeImage(images.indexOf(item))}
                        className="absolute -top-2 -right-2 bg-black bg-opacity-60 rounded-full p-1"
                      >
                        <Text className="text-white text-xs">✕</Text>
                      </Pressable>
                    </Pressable>
                  );
                }}
              />

              <Text className="text-gray-500 text-xs text-right">
                {images.length}/10 photos
              </Text>
            </View>



            <View className="mb-6">
              <Text className="text-base font-semibold mb-2">🎶 Add Music</Text>

              <Pressable
                onPress={async () => {
                  const clipboardContent = await Clipboard.getStringAsync();
                  setMusicUrl(clipboardContent);
                }}
                className="flex-row items-center justify-between px-4 py-3 bg-[#f1f5f9] rounded-2xl border border-gray-200 shadow-sm active:opacity-70"
              >
                <View className="flex-row items-center space-x-3">
                  <Text className="text-xl">🎧</Text>
                  <Text className="text-gray-800 font-medium text-base">
                    Import Music Here
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">Paste URL</Text>
              </Pressable>

              {musicError ? (
                <Text className="text-red-500 text-sm mt-2">{musicError}</Text>
              ) : musicMetadata ? (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  className="mt-4 p-4 rounded-2xl border border-gray-300 bg-white shadow-sm flex-row items-center"
                >
                  <Image
                    source={{ uri: musicMetadata.albumCover }}
                    className="w-16 h-16 rounded-lg mr-4"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                      {musicMetadata.title}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                      {musicMetadata.artist}
                    </Text>
                    <View className="flex-row items-center mt-1 space-x-1">
                      {musicMetadata.platform === 'spotify' ? (
                        <Entypo name="spotify" size={14} color="#1DB954" />
                      ) : (
                        <AntDesign name="youtube" size={14} color="#FF0000" />
                      )}
                      <Text className="text-xs text-gray-400">
                        {musicMetadata.platform === 'spotify' ? 'Spotify' : 'YouTube'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(musicMetadata.previewUrl!)}
                    className="ml-3 p-2 rounded-full bg-gray-200"
                  >
                    <AntDesign name="arrowright" size={20} color="#000" />
                  </TouchableOpacity>

                </Animated.View>
              ) : null}
            </View>



            {/* Text Input */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-2">📝 Caption</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-2xl p-4 text-base min-h-[120px] shadow-sm"
                placeholder="Share what’s on your mind..."
                placeholderTextColor="#9CA3AF"
                value={text}
                onChangeText={setText}
                multiline
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Enter') {
                    Keyboard.dismiss();
                  }
                }}
                textAlignVertical="top"
                ref={captionRef}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{
                  backgroundColor: 'white',
                  borderColor: '#D1D5DB',
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                  minHeight: 120,
                  textAlignVertical: 'top',
                }}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                      y: 350,
                      animated: true,
                    });
                  }, 150);
                }}

              />
            </View>


            {/* Location */}
            <View className="mb-6">
              <Text className="text-base font-medium mb-2">Location (Optional)</Text>

              {/* Search Input with Current Location and Clear */}
              <View className="flex-row items-center mb-2 space-x-2">
                <View className="flex-1 relative">
                  <TextInput
                    className="bg-white pl-10 pr-10 border border-gray-300 text-base"
                    style={{
                      borderRadius: 16,
                      paddingVertical: 10,
                      height: 48, // consistent height for input + icon
                      fontSize: 16,
                      lineHeight: 20,
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      shadowOffset: { width: 0, height: 1 },
                      textAlignVertical: 'center',
                    }}
                    placeholder="Search for a place"
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    onFocus={() => {
                      setIsPickingLocation(true);
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({
                          y: 500,
                          animated: true,
                        });
                      }, 300);
                    }}
                  />

                  {/* Left Icon */}
                  <Pressable
                    onPress={fetchCurrentLocation}
                    className="absolute left-3 top-0 bottom-0 justify-center items-center"
                    hitSlop={10}
                  >
                    <Text className="text-gray-400 text-base">📍</Text>
                  </Pressable>


                  {/* Right Clear Button */}
                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="absolute right-3 h-full justify-center items-center"
                    >
                      <Text className="text-gray-400 text-base">✖️</Text>
                    </Pressable>
                  )}
                </View>
              </View>


              {/* Suggestion Dropdown */}
              {searchResults.length > 0 && (
                <View className="bg-white rounded-2xl border border-gray-200 shadow-sm max-h-64 mb-3 overflow-hidden">
                  {searchResults.map((item, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        fetchPlaceDetails(item.place_id, item.description);
                        setSearchResults([]);
                        setIsPickingLocation(true);
                      }}
                      className={`flex-row items-start px-4 py-3 ${index !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <Text className="text-lg mr-3">📍</Text>
                      <View className="flex-1">
                        <Text className="text-sm text-gray-900" numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}


              {/* MapView */}
              {isPickingLocation && region && (
                <View className="relative mt-2">
                  {/* Map */}
                  <MapView
                    ref={mapRef}
                    style={{ height: 200, borderRadius: 16 }}
                    region={region}
                    onPress={handleMapPress}
                    showsUserLocation={true}
                  >
                    <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
                  </MapView>

                  {/* Current Location Button - bottom right inside map */}
                  <Pressable
                    onPress={fetchCurrentLocation}
                    className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow items-center justify-center"
                  >
                    <LocateFixed size={18} color="#4B5563" />
                  </Pressable>

                  {/* Save & Close */}
                  <Pressable
                    onPress={() => setIsPickingLocation(false)}
                    className="mt-4 px-4 py-3 bg-gray-800 rounded-2xl shadow-sm"
                  >
                    <Text className="text-white text-center font-medium text-base">Save & Close</Text>
                  </Pressable>
                </View>
              )}


              {/* Loading */}
              {loadingLocation && (
                <View className="absolute inset-0 items-center justify-center bg-white bg-opacity-70 rounded-xl">
                  <ActivityIndicator size="large" />
                </View>
              )}
            </View>


            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              className={`p-4 rounded-lg ${isSubmitting ? 'bg-gray-400' : 'bg-red-500'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-medium">Post</Text>
              )}
            </Pressable>
            <Modal
              isVisible={previewIndex !== null}
              onBackdropPress={() => setPreviewIndex(null)}
              onBackButtonPress={() => setPreviewIndex(null)}
              style={{ margin: 0 }}
              useNativeDriver
            >
              <>
                <ImageViewer
                  imageUrls={images.map((uri) => ({ url: uri }))}
                  index={previewIndex ?? 0}
                  enableSwipeDown
                  onSwipeDown={() => setPreviewIndex(null)}
                  onCancel={() => setPreviewIndex(null)}
                  backgroundColor="rgba(0,0,0,0.95)"
                  renderIndicator={(currentIndex, allSize) => (
                    <View
                      style={{
                        position: 'absolute',
                        top: Platform.OS === 'ios' ? 60 : 40,
                        alignSelf: 'center',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 13 }}>
                        {currentIndex} / {allSize}
                      </Text>
                    </View>
                  )}
                  renderHeader={() => (
                    <View
                      style={{
                        position: 'absolute',
                        top: Platform.OS === 'ios' ? 60 : 40,
                        right: 20,
                        zIndex: 10,
                      }}
                    >
                      <Pressable
                        onPress={() => setPreviewIndex(null)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 999,
                          shadowColor: '#000',
                          shadowOpacity: 0.1,
                          shadowOffset: { width: 0, height: 2 },
                          shadowRadius: 4,
                        }}
                      >
                        <Text style={{ color: '#111', fontWeight: '600' }}>Close</Text>
                      </Pressable>
                    </View>
                  )}
                />
              </>
            </Modal>
            {isSubmitting && (
              <View className="absolute inset-0 bg-white/70 z-50 items-center justify-center">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="mt-4 text-base text-gray-700 font-medium">Uploading...</Text>
              </View>
            )}



          </ScrollView></TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <FooterNavBar />
    </Layout>


  );
}
