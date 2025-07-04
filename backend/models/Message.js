const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Message subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['inquiry', 'callback_request', 'general'],
    default: 'inquiry'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Contact preferences
  contactPreferences: {
    phone: {
      type: Boolean,
      default: false
    },
    email: {
      type: Boolean,
      default: false
    },
    whatsapp: {
      type: Boolean,
      default: false
    }
  },
  // Sender's contact info (optional, based on preferences)
  senderContact: {
    name: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to archive message
messageSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    receiver: userId, 
    isRead: false, 
    isArchived: false 
  });
};

// Pre-save middleware to handle contact info based on preferences
messageSchema.pre('save', function(next) {
  if (this.isNew) {
    // Only include contact info if user has consented
    if (!this.contactPreferences.phone) {
      this.senderContact.phone = undefined;
    }
    if (!this.contactPreferences.email) {
      this.senderContact.email = undefined;
    }
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema); 