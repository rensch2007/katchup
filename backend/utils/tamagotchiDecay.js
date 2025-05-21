// tamagotchiDecay.js
const mongoose = require('mongoose');
const Room = require('../models/Room'); // Adjust if needed

const MONGO_URI = process.env.MONGO_URI;

const DECAY_RATES = {
  hunger: 10,
  happiness: 5,
  thirst: 7,
};

async function decayTamagotchis() {
  await mongoose.connect(MONGO_URI);
  const rooms = await Room.find({});

  for (const room of rooms) {
    const tamagotchi = room.tamagotchi?.main;
    if (!tamagotchi) continue;

    // Decay each stat
    let spoiled = false;
    for (const stat in DECAY_RATES) {
      const newVal = (tamagotchi.stats[stat] ?? 0) - DECAY_RATES[stat];
      tamagotchi.stats[stat] = Math.max(0, newVal);
      if (newVal <= 0) spoiled = true;
    }

    if (spoiled) {
      tamagotchi.stage = 'seed';
      tamagotchi.stats = { hunger: 60, happiness: 60, thirst: 60 };
      tamagotchi.deathCount += 1;
      tamagotchi.evolutionStreak = 0;
      tamagotchi.daysSurvived = 0;
    } else {
      tamagotchi.daysSurvived += 1;
    }

    room.markModified('tamagotchi.main');
    await room.save();
  }

  await mongoose.disconnect();
}

module.exports.handler = async () => {
  console.log('[CRON] Starting tamagotchi stat decay...');
  await decayTamagotchis();
  console.log('[CRON] Tamagotchi decay complete');
};
