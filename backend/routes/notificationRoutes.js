const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Get all notifications for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    
    res.status(200).json({
      success: true,
      count: user.notifications.length,
      data: user.notifications.sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark a notification as read
router.patch('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const notification = user.notifications.id(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    notification.read = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.notifications.forEach(notification => {
      notification.read = true;
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a notification
router.delete('/:notificationId', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { notifications: { _id: req.params.notificationId } }
    });
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;