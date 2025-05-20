const STAGES = ['seed', 'sprout', 'tomato', 'bottle'];

const EVOLUTION_REQUIREMENTS = {
  seed:     { next: 'sprout', days: 3, stats: 80, streak: 2 },
  sprout:   { next: 'tomato', days: 4, stats: 85, streak: 3 },
  tomato:   { next: 'bottle', days: 6, stats: 90, streak: 4 },
};

function isStatsHighEnough(stats, threshold) {
  return (
    stats.hunger >= threshold &&
    stats.happiness >= threshold &&
    stats.thirst >= threshold
  );
}

function getNextStage(currentStage) {
  return EVOLUTION_REQUIREMENTS[currentStage]?.next || null;
}

async function evolveFriendIfEligible(room) {
  if (!room?.tamagotchi?.currentGrowingFriend) return;

  const tg = room.tamagotchi.currentGrowingFriend;
  const req = EVOLUTION_REQUIREMENTS[tg.stage];
  if (!req) return; // Already at bottle

  const meetsStats = isStatsHighEnough(tg.stats, req.stats);

  if (meetsStats) {
    tg.evolutionStreak += 1;
  } else {
    tg.evolutionStreak = 0;
  }

  tg.daysSurvived += 1;

  const hasEnoughDays = tg.daysSurvived >= req.days;
  const hasEnoughStreak = tg.evolutionStreak >= req.streak;

  if (hasEnoughDays && hasEnoughStreak) {
    tg.stage = req.next;
    tg.evolutionStreak = 0;
    tg.daysSurvived = 0;

    // Reached final stage → move to friends list
    if (tg.stage === 'bottle') {
      const newFriendName = generateFriendName(room); // Optional
      room.tamagotchi.friends.push({
        name: newFriendName,
        social: 50,
        unlockedAt: new Date(),
      });

      // Reset currentGrowingFriend
      room.tamagotchi.currentGrowingFriend = {
        name: generateFriendName(room),
        stage: 'seed',
        stats: { hunger: 60, happiness: 60, thirst: 60 },
        daysSurvived: 0,
        evolutionStreak: 0,
        lastDecayDate: null,
      };
    }
  }

  room.markModified('tamagotchi');
  await room.save();
}

function generateFriendName(room) {
  const friendCount = room.tamagotchi.friends.length;
  const defaultNames = ['Mayo', 'Mustard', 'BBQ', 'Pickle', 'Relish', 'Gochujang'];
  return defaultNames[friendCount % defaultNames.length] || `Friend${friendCount + 1}`;
}

module.exports = { evolveFriendIfEligible };
