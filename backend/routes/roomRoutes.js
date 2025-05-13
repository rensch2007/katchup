const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const RoomUserPostLog = require('../models/RoomUserPostLog');
const { getLogicalDay } = require('../utils/streakHelpers'); // reuse your existing helper

// Create a new room
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    console.log('Creating room with name:', name || '[auto-generated]');

    // Create room with creator
    const room = new Room({
      name: name || undefined, // Use default random name if not provided
      creator: req.user.id,
      members: [req.user.id] // Explicitly add creator as member
    });

    await room.save();

    // Add room to user's rooms
    await User.findByIdAndUpdate(req.user.id, {
      $push: { rooms: room._id }, $set: { defaultRoom: room._id }
    });

    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all rooms the user is a member of
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user.id
    }).populate('members', 'username');

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get a single room by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members', 'username')
      .populate('invitations.user', 'username');

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }


    const isMember = room.members.some(member =>
      member.username === req.user.username
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this room'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Invite users to a room
router.post('/:id/invite', authMiddleware, async (req, res) => {
  try {
    const { usernames } = req.body;

    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of usernames to invite'
      });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Check if user is a member or creator of the room
    const isMemberOrCreator =
      room.creator.toString() === req.user.id ||
      room.members.some(member => member.toString() === req.user.id);

    /*
    if (!isMemberOrCreator) {
      return res.status(403).json({
        success: false,
        error: 'Only room members can invite others'
      });
    }
    */

    // Find users by usernames
    const users = await User.find({ username: { $in: usernames } });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No users found with the provided usernames'
      });
    }

    const invitedUsers = [];
    const invalidUsers = [];

    for (const user of users) {
      // Check if user is already a member
      const isMember = room.members.some(memberId =>
        memberId.toString() === user._id.toString()
      );

      if (isMember) {
        invalidUsers.push({
          username: user.username,
          reason: 'Already a member'
        });
        continue;
      }

      // Check if user is already invited
      const isInvited = room.invitations.some(invitation =>
        invitation.user.toString() === user._id.toString() &&
        invitation.status === 'pending'
      );

      if (isInvited) {
        invalidUsers.push({
          username: user.username,
          reason: 'Already invited'
        });
        continue;
      }

      // Add invitation to room
      room.invitations.push({
        user: user._id,
        status: 'pending',
        invitedAt: Date.now()
      });

      // Add notification to user
      await User.findByIdAndUpdate(user._id, {
        $push: {
          notifications: {
            type: 'room_invitation',
            message: `You have been invited to join room: ${room.name}`,
            roomId: room._id,
            read: false,
            createdAt: Date.now()
          }
        }
      });

      invitedUsers.push(user.username);
    }

    await room.save();

    res.status(200).json({
      success: true,
      data: {
        invited: invitedUsers,
        invalid: invalidUsers
      }
    });
  } catch (error) {
    console.error('Invite users error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Join a room with invitation
router.post('/invitations/:roomId/accept', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Check if user has a pending invitation
    const invitationIndex = room.invitations.findIndex(invitation =>
      invitation.user.toString() === req.user.id.toString() &&
      invitation.status === 'pending'
    );

    if (invitationIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'You do not have a pending invitation to this room'
      });
    }

    // Update invitation status
    room.invitations[invitationIndex].status = 'accepted';

    // Add user as a member
    room.members.push(req.user.id);

    await room.save();

    // Add room to user's rooms
    await User.findByIdAndUpdate(req.user.id, {
      $push: { rooms: room._id },
      $pull: {
        notifications: {
          type: 'room_invitation',
          roomId: room._id
        }
      }
    });

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Decline a room invitation
router.post('/invitations/:roomId/decline', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Check if user has a pending invitation
    const invitationIndex = room.invitations.findIndex(invitation =>
      invitation.user.toString() === req.user.id.toString() &&
      invitation.status === 'pending'
    );

    if (invitationIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'You do not have a pending invitation to this room'
      });
    }

    // Update invitation status
    room.invitations[invitationIndex].status = 'declined';
    await room.save();

    // Remove notification
    await User.findByIdAndUpdate(req.user.id, {
      $pull: {
        notifications: {
          type: 'room_invitation',
          roomId: room._id
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Invitation declined successfully'
    });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Join a room using room code
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a room code'
      });
    }

    const room = await Room.findOne({ code });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Invalid room code'
      });
    }

    // Ensure members is initialized as an array
    if (!Array.isArray(room.members)) {
      room.members = [];
    }

    // Check if user is already a member
    const isMember = room.members.some(memberId =>
      memberId.toString() === req.user.id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this room'
      });
    }

    // Add user as a member
    room.members.push(req.user.id);

    await room.save();

    // Add room to user's rooms
    await User.findByIdAndUpdate(req.user.id, {
      $push: { rooms: room._id }
    });

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id/streak-status', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const logicalDay = getLogicalDay(new Date(), room.cutoffHourKST || 3);

    const logs = await RoomUserPostLog.find({ roomId, date: logicalDay });
    const postedUserIds = logs.map(log => log.userId.toString());
    const allMemberIds = room.members.map(id => id.toString());

    res.json({
      success: true,
      date: logicalDay,
      postedUserIds,
      allMemberIds,
      youPostedToday: postedUserIds.includes(userId.toString()),
    });
  } catch (err) {
    console.error('[GET /rooms/:id/streak-status] Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;