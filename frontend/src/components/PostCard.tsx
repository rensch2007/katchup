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

  const username =
    typeof post.createdBy === 'string' ? 'Unknown' : post.createdBy.username;

  const formattedDate = new Date(post.createdAt).toLocaleDateString();

  // Try to shorten location (e.g., remove address details)
  const shortLocation = post.location?.split(',')[0] ?? '';

  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!post.images || post.images.length === 0 || !token) return;

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
    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', marginRight: 12 }} />
          <Text style={{ fontWeight: '600', fontSize: 16 }}>{username}</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#888' }}>{formattedDate}</Text>
      </View>

      {/* Image Carousel */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 12 }} />
      ) : signedImageUrls.length > 0 ? (
        <FlatList
          data={signedImageUrls}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: 340, alignItems: 'center' }}>
              <Image
                source={{ uri: item, cache: 'reload' }}
                style={{
                  width: 340,
                  height: 200,
                  borderRadius: 12,
                }}
                resizeMode="cover"
              />
            </View>
          )}
          contentContainerStyle={{ alignItems: 'center', marginBottom: 12 }}
        />
      ) : (
        <View style={{ height: 200, backgroundColor: '#eee', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#aaa' }}>No image available</Text>
        </View>
      )}

      {/* Text */}
      <Text style={{ fontSize: 14, color: '#333', marginBottom: 4 }}>{post.text}</Text>

      {/* Location */}
      {shortLocation && (
        <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>📍 {shortLocation}</Text>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: '#888' }}>💬 0 Comments</Text>
        <Text style={{ fontSize: 12, color: '#888' }}>❤️ 0 Likes</Text>
      </View>
    </View>
  );
}
