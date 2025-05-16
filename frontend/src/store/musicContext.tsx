import { BASE_URL } from '../config';

export interface MusicMetadata {
  platform: 'spotify' | 'youtube';
  trackId: string;
  title: string;
  artist: string;
  albumCover: string;
  previewUrl: string;
}

export const fetchMusicMetadata = async (url: string, token: string): Promise<MusicMetadata> => {
  try {
    const response = await fetch(`${BASE_URL}/music/metadata?url=${encodeURIComponent(url)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to fetch music metadata');
    }

    return await response.json();
  } catch (error: any) {
    console.error('[fetchMusicMetadata ERROR]', error.message);
    throw error;
  }
};
