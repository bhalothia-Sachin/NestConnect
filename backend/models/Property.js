const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  propertyType: {
    type: String,
    enum: ['PG', 'house', 'flat'],
    required: [true, 'Property type is required']
  },
  rent: {
    type: Number,
    required: [true, 'Rent amount is required'],
    min: [0, 'Rent cannot be negative']
  },
  rentType: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true
    },
    pinCode: {
      type: String,
      required: [true, 'Pin code is required'],
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pin code']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: false
      },
      longitude: {
        type: Number,
        required: false
      }
    }
  },
  facilities: {
    wifi: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    garden: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false }
  },
  propertyDetails: {
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
      default: 0
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
      default: 0
    },
    area: {
      type: Number,
      min: [0, 'Area cannot be negative'],
      default: 0
    },
    floor: {
      type: Number,
      min: [0, 'Floor cannot be negative'],
      default: 0
    },
    totalFloors: {
      type: Number,
      min: [0, 'Total floors cannot be negative'],
      default: 0
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  showOnMap: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  contactInfo: {
    showPhone: {
      type: Boolean,
      default: true
    },
    showEmail: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for search optimization
propertySchema.index({ 
  'location.city': 1, 
  'location.area': 1, 
  'location.pinCode': 1,
  propertyType: 1,
  rent: 1,
  isAvailable: 1
});

// Index for geospatial queries
propertySchema.index({ 
  'location.coordinates': '2dsphere' 
});

// Virtual for full address
propertySchema.virtual('fullAddress').get(function() {
  return `${this.location.address}, ${this.location.area}, ${this.location.city} - ${this.location.pinCode}`;
});

// Method to increment views
propertySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get facilities list
propertySchema.statics.getFacilitiesList = function() {
  return Object.keys(this.schema.paths.facilities.schema.paths);
};

module.exports = mongoose.model('Property', propertySchema); 