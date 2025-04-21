const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    default: () => `Room-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  code: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 10).toUpperCase(),
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Automatically add creator as a member
RoomSchema.pre('save', function(next) {
  if (this.isNew) {
    // Check if creator is already in members
    const creatorExists = this.members.some(memberId => 
      memberId.toString() === this.creator.toString()
    );
    
    if (!creatorExists) {
      this.members.push(this.creator);
    }
  }
  next();
});

module.exports = mongoose.model('Room', RoomSchema);