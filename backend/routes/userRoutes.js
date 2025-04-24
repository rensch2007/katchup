const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Update current user info
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, password, currentPassword, profileImage } = req.body;
    
    // Find user
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // If updating password, check current password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required to change password' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }
      user.password = password;
    }

    // If updating username or email, check for duplicates
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ success: false, error: 'Username already taken' });
      }
      user.username = username;
    }
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, error: 'Email already taken' });
      }
      user.email = email;
    }

    // If updating profile image
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    await user.save();
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
