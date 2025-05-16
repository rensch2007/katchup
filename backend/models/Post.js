const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  text: String,
  images: [String],
  location: String,
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  musicPlatform: {
    type: String,
    enum: ['spotify', 'youtube'],
    required: false,
  },
  musicTrackId: {
    type: String,
  },
  musicTitle: {
    type: String,
  },
  musicArtist: {
    type: String,
  },
  musicAlbumCover: {
    type: String,
  },
  musicPreviewUrl: {
    type: String,
  },

});

module.exports = mongoose.model('Post', postSchema);
