const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

const ACTIONS = {
  feed: 'hunger',
  play: 'happiness',
  water: 'thirst',
};

const STAT_BOOST = 10;
const POINT_COST = 1;

const handleAction = async (req, res, type) => {
  const { roomId } = req.body;

  if (!roomId || !ACTIONS[type]) {
    return res.status(400).json({ success: false, message: 'Invalid room or action' });
  }

  const room = await Room.findById(roomId).lean(false);

  if (!room || !room.tamagotchi || !room.tamagotchi.main) {
    return res.status(404).json({ success: false, message: 'Room or Tamagotchi not found' });
  }

  if (room.katchupPoints < POINT_COST) {
    return res.status(403).json({ success: false, message: 'Not enough katchup points' });
  }

  const stat = ACTIONS[type];
  const current = room.tamagotchi.main.stats?.[stat] ?? 0;
  const updated = Math.min(100, current + STAT_BOOST);

  room.tamagotchi.main.stats = {
    ...room.tamagotchi.main.stats,
    [stat]: updated
  };

  room.katchupPoints -= POINT_COST;

  // Mark modified paths
  room.markModified('tamagotchi.main.stats');
  room.markModified('tamagotchi');

  console.log('[FEED DEBUG - PRE SAVE]', {
    action: type,
    stat,
    updatedValue: updated,
    katchupPoints: room.katchupPoints,
    tamagotchiStats: room.tamagotchi.main.stats,
  });

  await room.save();

  const postSave = await Room.findById(roomId);
  console.log('[FEED DEBUG - POST SAVE]', {
    savedStats: postSave?.tamagotchi?.main?.stats,
    savedPoints: postSave?.katchupPoints,
  });

  return res.json({
    success: true,
    newStatValue: updated,
    pointsLeft: room.katchupPoints,
  });
};

// GET tamagotchi status
router.get('/status/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId);
    if (!room || !room.tamagotchi) {
      return res.status(404).json({ success: false, message: 'Room or Tamagotchi not found' });
    }

    return res.json({
      success: true,
      tamagotchi: {
        main: room.tamagotchi.main,
        currentGrowingFriend: room.tamagotchi.currentGrowingFriend,
        friends: room.tamagotchi.friends,
      },
      pointsLeft: room.katchupPoints,
    });
  } catch (err) {
    console.error('[GET /status] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST hangout with a friend
router.post('/hangout/:friendName', async (req, res) => {
  const { roomId } = req.body;
  const { friendName } = req.params;

  if (!roomId || !friendName) {
    return res.status(400).json({ success: false, message: 'Missing roomId or friend name' });
  }

  const room = await Room.findById(roomId);
  if (!room || !room.tamagotchi || !Array.isArray(room.tamagotchi.friends)) {
    return res.status(404).json({ success: false, message: 'Room or Tamagotchi not found' });
  }

  if (room.katchupPoints < 1) {
    return res.status(403).json({ success: false, message: 'Not enough katchup points' });
  }

  const friend = room.tamagotchi.friends.find(f => f.name.toLowerCase() === friendName.toLowerCase());
  if (!friend) {
    return res.status(404).json({ success: false, message: 'Friend not found' });
  }

  // Boost social stat
  friend.social = Math.min(100, friend.social + 10);
  room.katchupPoints -= 1;

  room.markModified('tamagotchi.friends');
  await room.save();

  return res.json({
    success: true,
    newSocial: friend.social,
    pointsLeft: room.katchupPoints,
    friendName: friend.name,
  });
});

// POST feed/play/water endpoints
router.post('/feed', (req, res) => {
  console.log('[FEED DEBUG] incoming roomId =', req.body.roomId);
  return handleAction(req, res, 'feed');
});
router.post('/play', (req, res) => handleAction(req, res, 'play'));
router.post('/water', (req, res) => handleAction(req, res, 'water'));

module.exports = router;
