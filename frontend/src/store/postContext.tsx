import React, { createContext, useContext, useState } from 'react';
import { BASE_URL } from '../config';
import { useAuth } from './authContext';
import { useRoom } from './roomContext';
import * as FileSystem from 'expo-file-system';

interface Post {
  text: string;
  image?: string[] | null;
  location?: string;
}

interface Post {
  text: string;
  image?: string[] | null;
  location?: string;
  musicPlatform?: 'spotify' | 'youtube';
  musicTrackId?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicAlbumCover?: string;
  musicPreviewUrl?: string;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const { currentRoom } = useRoom();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (post: Post): Promise<boolean> => {
    if (!token || !currentRoom || !user) {
      setError('Missing authentication or room context');
      return false;
    }
    console.log('[createPost] user._id =', user._id);

    setIsLoading(true);
    setError(null);

    try {
      let imageUrls: string[] = [];

      if (post.image && post.image.length > 0) {
        for (const image of post.image) {
          const fileName = image.split('/').pop();
          const fileType = fileName?.split('.').pop();

          const signedRes = await fetch(`${BASE_URL}/posts/s3-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fileName, fileType }),
          });

          const signedData = await signedRes.json();

          await FileSystem.uploadAsync(signedData.url, image, {
            httpMethod: 'PUT',
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers: {
              'Content-Type': `image/${fileType}`,
            },
          });

          const publicUrl = signedData.url.split('?')[0];
          imageUrls.push(publicUrl);
        }
      }

      const postPayload = {
        text: post.text,
        images: imageUrls,
        location: post.location,
        roomId: currentRoom._id,
        createdBy: user._id,
        ...(post.musicPlatform && {
          musicPlatform: post.musicPlatform,
          musicTrackId: post.musicTrackId,
          musicTitle: post.musicTitle,
          musicArtist: post.musicArtist,
          musicAlbumCover: post.musicAlbumCover,
          musicPreviewUrl: post.musicPreviewUrl,
        }),
      };


      const res = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postPayload),
      });

      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('[createPost ERROR]', err);
      setError('Failed to create post');
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  const clearError = () => setError(null);

  return (
    <PostContext.Provider value={{ createPost, isLoading, error, clearError }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePostContext must be used within a PostProvider');
  return context;
};
