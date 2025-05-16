const express = require('express');
const https = require('https');
const router = express.Router();
const { extractSpotifyId, extractYouTubeId } = require('../utils/musicHelpers');

const SPOTIFY_TOKEN = process.env.SPOTIFY_TOKEN;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const fetchJson = (url, options = {}) =>
  new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });

router.get('/metadata', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    if (url.includes('spotify.com')) {
      const trackId = extractSpotifyId(url);
      const apiUrl = `https://api.spotify.com/v1/tracks/${trackId}`;
      const spotifyData = await fetchJson(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${SPOTIFY_TOKEN}`,
        },
      });

      return res.json({
        platform: 'spotify',
        trackId,
        title: spotifyData.name,
        artist: spotifyData.artists.map(a => a.name).join(', '),
        albumCover: spotifyData.album.images[0]?.url,
        previewUrl: spotifyData.preview_url,
      });
    }

    if (url.includes('music.youtube.com') || url.includes('youtube.com/watch')) {
      const videoId = extractYouTubeId(url);
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
      const ytData = await fetchJson(apiUrl);

      const snippet = ytData.items?.[0]?.snippet;
      if (!snippet) return res.status(404).json({ error: 'YouTube video not found' });

      return res.json({
        platform: 'youtube',
        trackId: videoId,
        title: snippet.title,
        artist: snippet.channelTitle,
        albumCover: snippet.thumbnails?.high?.url,
        previewUrl: `https://www.youtube.com/embed/${videoId}`,
      });
    }

    return res.status(400).json({ error: 'Unsupported music platform' });
  } catch (error) {
    console.error('[Metadata Error]', error.message || error);
    return res.status(500).json({ error: 'Failed to fetch music metadata' });
  }
});

module.exports = router;
