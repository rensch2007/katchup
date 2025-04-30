// app/(app)/create-post.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, Pressable, Image, ScrollView, FlatList, ActivityIndicator, Platform, TouchableOpacity, KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { MapView, Marker } from '../../src/components/SafeMapView/MapView';
import { LocateFixed } from 'lucide-react-native'; 
import { usePost } from '../../src/store/postContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';



export default function CreatePost() {
    const router = useRouter();
    const { createPost } = usePost();
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

        await createPost({
            text,
            image: images,
            location: location ? `${location.address} (${location.latitude}, ${location.longitude})` : undefined,
        });
        //need to connect to backend api once done.
        router.push('/');
    };



    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView className="flex-1 p-4" ref={scrollViewRef} keyboardShouldPersistTaps="handled">
                        <Text className="text-2xl font-bold mb-4">Create Post</Text>

                        {/* Image Picker */}
                        <View className="border-2 border-dashed border-gray-300 rounded-xl p-4 mb-6 min-h-[150px]">
                            {images.length === 0 ? (
                                <Pressable
                                    onPress={pickImages}
                                    className="flex-1 items-center justify-center min-h-[150px]"
                                >
                                    <Text className="text-gray-400">📷 Tap here to select photos</Text>
                                </Pressable>
                            ) : (
                                <View>
                                    <FlatList
                                        data={[...images, 'add']}
                                        scrollEnabled={true}
                                        horizontal={true}
                                        nestedScrollEnabled={true}
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(item, index) => index.toString()}
                                        contentContainerStyle={{ paddingVertical: 15 }} // better spacing
                                        renderItem={({ item, index }) =>
                                            item === 'add' ? (
                                                images.length < 10 && (
                                                    <Pressable
                                                        onPress={pickImages}
                                                        className="w-24 h-24 bg-gray-100 rounded-lg items-center justify-center mr-3"
                                                    >
                                                        <Text className="text-3xl text-gray-400">+</Text>
                                                    </Pressable>
                                                )
                                            ) : (
                                                <View className="relative mr-3">
                                                    <Image
                                                        source={{ uri: item }}
                                                        className="w-24 h-24 rounded-lg"
                                                        resizeMode="cover"
                                                    />
                                                    <Pressable
                                                        onPress={() => removeImage(index)}
                                                        className="absolute -right-2 bg-black rounded-full p-1"
                                                    >
                                                        <Text className="text-white text-xs"> ✕ </Text>
                                                    </Pressable>
                                                </View>
                                            )
                                        }
                                        style={{ height: 120 }} // force height for horizontal scrolling
                                    />
                                    <Text className="text-gray-500 text-xs mt-2 text-right">
                                        {images.length}/10 photos
                                    </Text>
                                </View>
                            )}
                        </View>


                        {/* Text Input */}
                        <TextInput
                            className="border rounded p-3 mb-4 h-32 text-base"
                            multiline
                            placeholder="What's on your mind?"

                            placeholderTextColor="#808080"
                            value={text}
                            onChangeText={setText}
                        />

                        {/* Location */}
                        <View className="mb-6">
  <Text className="text-base font-medium mb-2">Location (Optional)</Text>

  {/* Search Input with Current Location and Clear */}
  <View className="flex-row items-center mb-2 space-x-2">
    {/* Search Field + Buttons */}
    <View className="flex-1 relative">
    <TextInput
  className="border rounded p-3 pl-10 pr-10 bg-white"
  placeholder="Search for a place"
  value={searchQuery}
  onChangeText={handleSearch}
  onFocus={() => {
    setIsPickingLocation(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 300, // Adjust this value depending on how far down your MapView is
        animated: true,
      });
    }, 300); // wait a bit to let the map render
  }}
/>


      {/* 📍 Current Location Button */}
      <Pressable
        onPress={fetchCurrentLocation}
        className="absolute left-3 top-0 bottom-0 justify-center"
      >
        <LocateFixed size={18} color="#6b7280" />
      </Pressable>

      {/* ✖️ Clear Button */}
      {searchQuery.length > 0 && (
        <Pressable
          onPress={() => {
            setSearchQuery('');
            setSearchResults([]);
          }}
          className="absolute right-3 top-0 bottom-0 justify-center"
        >
          <Text className="text-gray-400 text-base">✖️</Text>
        </Pressable>
      )}
    </View>
  </View>

  {/* Suggestion Dropdown */}
  {searchResults.length > 0 && (
    <View className="border rounded bg-white max-h-60 mb-2">
      {searchResults.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => {
            fetchPlaceDetails(item.place_id, item.description); // pass description too
  setSearchResults([]);
  setIsPickingLocation(true);
          }}
          className="p-3 border-b border-gray-200"
        >
          <Text>{item.description}</Text>
        </Pressable>
      ))}
    </View>
  )}

  {/* MapView */}
  {isPickingLocation && region && (
    <>
      <MapView
        ref={mapRef}
        style={{ height: 200, borderRadius: 12 }}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>

      {/* Save Location Button */}
      <Pressable
        onPress={() => setIsPickingLocation(false)}
        className="bg-gray-500 rounded-lg p-3 mt-3"
      >
        <Text className="text-white text-center font-medium">Save & Close</Text>
      </Pressable>
    </>
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
                            className="bg-red-500 p-4 rounded-lg"
                        >
                            <Text className="text-white text-center font-medium">Post</Text>
                        </Pressable>
                    </ScrollView></TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>

    );
}
