const mongoose = require('mongoose');

const roomUserPostLogSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // Format: 'YYYY-MM-DD'
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Prevent duplicates
roomUserPostLogSchema.index({ roomId: 1, userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('RoomUserPostLog', roomUserPostLogSchema);

