// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

router.post('/s3-url', async (req, res) => {
    try {
        console.log('[POST /s3-url] body:', req.body);

        const { fileName, fileType } = req.body;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Expires: 60,
            ContentType: `image/${fileType}`,
        };

        const url = await s3.getSignedUrlPromise('putObject', params);
        console.log('[POST /s3-url] signed URL generated:', url);
        res.json({ url });
    } catch (err) {
        console.error('[POST /s3-url] error:', err);
        res.status(500).json({ error: 'Failed to generate signed URL' });
    }
});


router.post('/', async (req, res) => {
    console.log('[POST /api/posts] Incoming body:', req.body);
  
    try {
      const { text, images, location, roomId, createdBy } = req.body;
  
      if (!roomId || !createdBy) {
        console.error('[POST ERROR] Missing roomId or createdBy');
        return res.status(400).json({
          success: false,
          message: 'roomId and createdBy are required',
        });
      }
  
      const newPost = new Post({
        text,
        images,
        location,
        roomId,
        createdBy,
      });
  
      await newPost.save();
      console.log('[POST] Saved post successfully:', newPost);
  
      return res.json({ success: true });
    } catch (err) {
      console.error('[POST ERROR]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });
  

// backend/routes/posts.js
router.get('/room/:roomId', async (req, res) => {
    try {
      const { roomId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const posts = await Post.find({ roomId })
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
  
      res.json({ success: true, data: posts });
    } catch (err) {
      console.error('[GET posts/room/:id] error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
  

// GET signed URL to view image (auth-protected)
router.get('/signed-url', authMiddleware, async (req, res) => {
    const { key } = req.query;
    console.log('[GET /signed-url] requested key =', key);
  
    if (!key) {
      return res.status(400).json({ success: false, message: 'Missing key' });
    }
  
    try {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Expires: 60,
      });
  
      return res.json({ success: true, url });
    } catch (err) {
      console.error('[signed-url GET ERROR]', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
  
  

module.exports = router;
