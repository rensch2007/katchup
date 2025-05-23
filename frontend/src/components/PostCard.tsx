import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { BASE_URL } from '../config';
import { useAuth } from '../store/authContext';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

type PostCardProps = {
post: {
  text: string;
  images?: string[];
  location?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  } | string;
  musicPlatform?: 'spotify' | 'youtube';
  musicTrackId?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicAlbumCover?: string;
  musicPreviewUrl?: string;
};

};

export default function PostCard({ post }: PostCardProps) {
  const { token } = useAuth();
  const [signedImageUrls, setSignedImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageRenderLoading, setImageRenderLoading] = useState(true);
  const { width: screenWidth } = Dimensions.get('window');
  const router = useRouter();
  const username =
    typeof post.createdBy === 'string' ? 'Unknown' : post.createdBy.username;

  const formattedDate = new Date(post.createdAt).toLocaleDateString();
const musicButtonStyle = {
  marginTop: 8,
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
};

const musicTextStyle = {
  color: 'white',
  fontSize: 13,
  fontWeight: '600',
};
  // Try to shorten location (e.g., remove address details)
  const shortLocation = post.location?.split(',')[0] ?? '';

  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!post.images || post.images.length === 0 || !token) {
        setSignedImageUrls([]); // ensure it's empty
        setLoading(false);
        return;
      }

      try {
        const urls: string[] = [];

        for (const raw of post.images) {
          const s3Key = new URL(raw).pathname.slice(1);
          const res = await fetch(`${BASE_URL}/posts/signed-url?key=${s3Key}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const json = await res.json();
          if (json.success) {
            urls.push(json.url);
          } else {
            console.warn('[PostCard] Failed to get signed URL for', s3Key);
          }
        }

        setSignedImageUrls(urls);
      } catch (err) {
        console.error('[PostCard] Error fetching signed URLs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrls();
  }, [post.images, token]);

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 12,
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Avatar */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#ccc',
              marginRight: 10,
            }}
          />
          {/* Username + Location */}
          <View>
            <Text style={{ fontWeight: '600', fontSize: 15 }}>{username}</Text>
            {shortLocation ? (
              <Text style={{ fontSize: 12, color: '#888' }}>{shortLocation}</Text>
            ) : null}
          </View>
        </View>
  
        {/* Date */}
        <Text style={{ fontSize: 11, color: '#999' }}>{formattedDate}</Text>
      </View>
  
      {/* Image Section */}
      {post.images && post.images.length > 0 && (
        <View style={{ height: screenWidth, justifyContent: 'center', alignItems: 'center' }}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : signedImageUrls.length > 0 ? (
            <>
              <FlatList
  data={signedImageUrls}
  keyExtractor={(item, index) => `${item}-${index}`}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  getItemLayout={(_, index) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  })}
  snapToInterval={screenWidth}
  decelerationRate="fast"
  onMomentumScrollEnd={(event) => {
    const index = Math.floor(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    setActiveIndex(index);
  }}
  renderItem={({ item }) => (
    <Image
      source={{ uri: item }}
      style={{
        width: screenWidth,
        height: screenWidth,
        resizeMode: 'cover',
      }}
      onLoadEnd={() => setImageRenderLoading(false)}
    />
  )}
/>

  
              {/* Pagination Dots */}
              {signedImageUrls.length > 1 && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8, position: 'absolute', bottom: 10 }}>
                  {signedImageUrls.map((_, index) => (
                    <View
                      key={index}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        marginHorizontal: 4,
                        backgroundColor: index === activeIndex ? '#333' : '#ccc',
                      }}
                    />
                  ))}
                </View>
              )}
            </>
          ) : null}
        </View>
      )}
  {/* Music Section */}
{post.musicPlatform && post.musicTitle && (
  <View style={{ paddingHorizontal: 12, marginTop: 12 }}>
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
      }}
    >
      {/* Album Cover */}
      <Image
        source={{ uri: post.musicAlbumCover }}
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          marginRight: 12,
          backgroundColor: '#ddd',
        }}
      />

      {/* Info + Button */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', fontSize: 14, color: '#111' }} numberOfLines={1}>
          {post.musicTitle}
        </Text>
        <Text style={{ color: '#666', fontSize: 12 }} numberOfLines={1}>
          {post.musicArtist}
        </Text>

        <TouchableOpacity
          onPress={() => {
            const url =
              post.musicPlatform === 'spotify'
                ? `https://open.spotify.com/track/${post.musicTrackId}`
                : `https://music.youtube.com/watch?v=${post.musicTrackId}`;
            Linking.openURL(url);
          }}
          style={{
            marginTop: 8,
            paddingVertical: 8,
            paddingHorizontal: 14,
            backgroundColor:
              post.musicPlatform === 'spotify' ? '#25C75A' : '#E44848',
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
            Play on {post.musicPlatform === 'spotify' ? 'Spotify' : 'YouTube Music'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}





      {/* Caption */}
      {post.text?.trim() !== '' && (
        <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
          <Text style={{ fontSize: 14, color: '#333' }}>
            <Text style={{ fontWeight: '600' }}>{username} </Text>
            {post.text}
          </Text>
        </View>
      )}
    </View>
  );
  


}
