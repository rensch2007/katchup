const mongoose = require('mongoose');

// Inline Tamagotchi schema
const TamagotchiSchema = new mongoose.Schema({
  main: {
    character: { type: String, default: 'katchup' },
    stage: {
      type: String,
      enum: ['seed', 'sprout', 'tomato', 'bottle'],
      default: 'seed',
    },
    stats: {
      hunger: { type: Number, default: 60 },
      happiness: { type: Number, default: 60 },
      thirst: { type: Number, default: 60 },
    },
    health: { type: Number, default: 100 },
    deathCount: { type: Number, default: 0 },
    lastDecayDate: { type: Date, default: null },
  },

  currentGrowingFriend: {
    name: { type: String, default: 'seedling' },
    stage: {
      type: String,
      enum: ['seed', 'sprout', 'tomato', 'bottle'],
      default: 'seed',
    },
    stats: {
      hunger: { type: Number, default: 60 },
      happiness: { type: Number, default: 60 },
      thirst: { type: Number, default: 60 },
    },
    evolutionStreak: { type: Number, default: 0 },
    daysSurvived: { type: Number, default: 0 },
    lastDecayDate: { type: Date, default: null },
  },

  friends: [{
    name: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    social: { type: Number, default: 50 },
  }],
}, { _id: false });

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
  collectiveStreakCount: {
    type: Number,
    default: 0,
  },
  lastStreakDate: {
    type: String,
    default: null,
  },
  streakHistory: [{
    date: String,
    success: Boolean,
    userIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  cutoffHourKST: {
    type: Number,
    default: 3,
  },

  // ✅ Embedded tamagotchi logic
  tamagotchi: { type: TamagotchiSchema, default: () => ({}) },

  katchupPoints: {
    type: Number,
    default: 5, // you can adjust this baseline
  },
  katchupPostsToday: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: String }, // Format: 'YYYY-MM-DD'
  }],

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
RoomSchema.pre('save', function (next) {
  if (this.isNew) {
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
