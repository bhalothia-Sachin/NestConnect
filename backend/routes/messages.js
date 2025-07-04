const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Message = require('../models/Message');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages
// @desc    Send message to property owner
// @access  Private
router.post('/', protect, [
  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message content must be between 10 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['inquiry', 'callback_request', 'general'])
    .withMessage('Invalid message type'),
  body('contactPreferences.phone')
    .optional()
    .isBoolean()
    .withMessage('Phone preference must be boolean'),
  body('contactPreferences.email')
    .optional()
    .isBoolean()
    .withMessage('Email preference must be boolean'),
  body('contactPreferences.whatsapp')
    .optional()
    .isBoolean()
    .withMessage('WhatsApp preference must be boolean'),
  body('senderContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('senderContact.phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('senderContact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      propertyId,
      subject,
      content,
      messageType = 'inquiry',
      contactPreferences = {},
      senderContact = {}
    } = req.body;

    // Verify property exists and is available
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ message: 'Property is not available' });
    }

    // Prevent sending message to yourself
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Prepare sender contact info based on preferences
    const finalSenderContact = {};
    if (contactPreferences.phone && senderContact.phone) {
      finalSenderContact.phone = senderContact.phone;
    }
    if (contactPreferences.email && senderContact.email) {
      finalSenderContact.email = senderContact.email;
    }
    if (senderContact.name) {
      finalSenderContact.name = senderContact.name;
    }

    const message = new Message({
      sender: req.user._id,
      receiver: property.owner,
      property: propertyId,
      subject,
      content,
      messageType,
      contactPreferences,
      senderContact: finalSenderContact
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('property', 'title location');

    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// @route   GET /api/messages
// @desc    Get user's messages (sent and received)
// @access  Private
router.get('/', protect, [
  query('type')
    .optional()
    .isIn(['sent', 'received', 'all'])
    .withMessage('Type must be sent, received, or all'),
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be boolean'),
  query('page')
    .optional()
    .isNumeric()
    .withMessage('Page must be a number'),
  query('limit')
    .optional()
    .isNumeric()
    .withMessage('Limit must be a number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      type = 'all',
      isRead,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter
    const filter = { isArchived: false };

    if (type === 'sent') {
      filter.sender = req.user._id;
    } else if (type === 'received') {
      filter.receiver = req.user._id;
    } else {
      // 'all' - get both sent and received
      filter.$or = [
        { sender: req.user._id },
        { receiver: req.user._id }
      ];
    }

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const messages = await Message.find(filter)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('property', 'title location images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Message.countDocuments(filter);

    // Get unread count
    const unreadCount = await Message.getUnreadCount(req.user._id);

    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   GET /api/messages/:id
// @desc    Get message by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('property', 'title location images owner');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is authorized to view this message
    if (message.sender.toString() !== req.user._id.toString() && 
        message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this message' });
    }

    // Mark as read if user is the receiver
    if (message.receiver.toString() === req.user._id.toString() && !message.isRead) {
      await message.markAsRead();
    }

    res.json({ message });
  } catch (error) {
    console.error('Message fetch error:', error);
    res.status(500).json({ message: 'Server error fetching message' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    await message.markAsRead();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Message read error:', error);
    res.status(500).json({ message: 'Server error marking message as read' });
  }
});

// @route   PUT /api/messages/:id/archive
// @desc    Archive message
// @access  Private
router.put('/:id/archive', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is authorized to archive this message
    if (message.sender.toString() !== req.user._id.toString() && 
        message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to archive this message' });
    }

    await message.archive();

    res.json({ message: 'Message archived successfully' });
  } catch (error) {
    console.error('Message archive error:', error);
    res.status(500).json({ message: 'Server error archiving message' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Message deletion error:', error);
    res.status(500).json({ message: 'Server error deleting message' });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user._id);
    res.json({ unreadCount });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ message: 'Server error fetching unread count' });
  }
});

module.exports = router; 