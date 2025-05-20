// models/Tamagotchi.ts
import mongoose from 'mongoose';

const StatSchema = new mongoose.Schema({
  hunger: { type: Number, default: 100 },
  happiness: { type: Number, default: 100 },
  thirst: { type: Number, default: 100 },
}, { _id: false });

const TamagotchiSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, unique: true },

  stage: {
    type: String,
    enum: ['seed', 'sprout', 'tomato', 'bottle'],
    default: 'seed',
  },

  stats: { type: StatSchema, default: {} },

  daysSurvived: { type: Number, default: 0 },
  deathCount: { type: Number, default: 0 },

  evolutionStreak: { type: Number, default: 0 },
  lastDecayDate: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Tamagotchi ||
  mongoose.model('Tamagotchi', TamagotchiSchema);
