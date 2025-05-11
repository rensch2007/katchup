import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native';
import { BASE_URL } from '../config';
import { useAuth } from '../store/authContext';

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
  };
};

export default function PostCard({ post }: PostCardProps) {
  const { token } = useAuth();
  const [signedImageUrls, setSignedImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageRenderLoading, setImageRenderLoading] = useState(true);

  const username =
    typeof post.createdBy === 'string' ? 'Unknown' : post.createdBy.username;

  const formattedDate = new Date(post.createdAt).toLocaleDateString();

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
        <View style={{ height: 375, justifyContent: 'center', alignItems: 'center' }}>
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
                onMomentumScrollEnd={(event) => {
                  const index = Math.floor(
                    event.nativeEvent.contentOffset.x /
                    event.nativeEvent.layoutMeasurement.width
                  );
                  setActiveIndex(index);
                }}
                renderItem={({ item }) => (
                  <Image
  source={{ uri: item }}
  style={{ width: 375, height: 375, resizeMode: 'cover' }}
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
