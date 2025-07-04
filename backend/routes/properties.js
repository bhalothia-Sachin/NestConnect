const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult, query } = require('express-validator');
const Property = require('../models/Property');
const { protect, authorize, checkPropertyOwnership } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/properties
// @desc    Get all properties with filters
// @access  Private
router.get('/', protect, [
  query('city').optional().trim(),
  query('area').optional().trim(),
  query('pinCode').optional().trim(),
  query('propertyType').optional().isIn(['PG', 'house', 'flat']),
  query('minRent').optional().isNumeric(),
  query('maxRent').optional().isNumeric(),
  query('facilities').optional().isString(),
  query('page').optional().isNumeric(),
  query('limit').optional().isNumeric(),
  query('sortBy').optional().isIn(['rent', 'createdAt', 'views']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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
      city,
      area,
      pinCode,
      propertyType,
      minRent,
      maxRent,
      facilities,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (area) filter['location.area'] = new RegExp(area, 'i');
    if (pinCode) filter['location.pinCode'] = pinCode;
    if (propertyType) filter.propertyType = propertyType;
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = parseInt(minRent);
      if (maxRent) filter.rent.$lte = parseInt(maxRent);
    }

    // Handle facilities filter
    if (facilities) {
      const facilityList = facilities.split(',').map(f => f.trim());
      facilityList.forEach(facility => {
        if (facility) {
          filter[`facilities.${facility}`] = true;
        }
      });
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const properties = await Property.find(filter)
      .populate('owner', 'name phone email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    // Increment views for all users (now all are authenticated)
    properties.forEach(async (property) => {
      await Property.findByIdAndUpdate(property._id, { $inc: { views: 1 } });
    });

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Properties fetch error:', error);
    res.status(500).json({ message: 'Server error fetching properties' });
  }
});

// @route   GET /api/properties/map
// @desc    Get properties for map view
// @access  Private
router.get('/map', protect, [
  query('bounds').optional().isString(),
  query('city').optional().trim()
], async (req, res) => {
  try {
    const { bounds, city } = req.query;
    const filter = { 
      isAvailable: true, 
      showOnMap: true,
      'location.coordinates.latitude': { $exists: true, $ne: null },
      'location.coordinates.longitude': { $exists: true, $ne: null }
    };

    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    // If bounds provided, filter by geographic bounds
    if (bounds) {
      const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
      filter['location.coordinates'] = {
        $geoWithin: {
          $box: [
            [swLng, swLat],
            [neLng, neLat]
          ]
        }
      };
    }

    const properties = await Property.find(filter)
      .select('title rent propertyType location.coordinates location.area location.city images')
      .limit(100)
      .lean();

    res.json({ properties });
  } catch (error) {
    console.error('Map properties fetch error:', error);
    res.status(500).json({ message: 'Server error fetching map properties' });
  }
});

// @route   GET /api/properties/featured
// @desc    Get featured properties
// @access  Private
router.get('/featured', protect, async (req, res) => {
  try {
    const properties = await Property.find({ 
      isAvailable: true, 
      isVerified: true 
    })
      .populate('owner', 'name phone email role')
      .sort({ views: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ properties });
  } catch (error) {
    console.error('Featured properties fetch error:', error);
    res.status(500).json({ message: 'Server error fetching featured properties' });
  }
});

// @route   GET /api/properties/my-properties
// @desc    Get user's properties
// @access  Private
router.get('/my-properties', protect, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ properties });
  } catch (error) {
    console.error('User properties fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user properties' });
  }
});

// @route   GET /api/properties/user/my-properties
// @desc    Get user's properties (alternative endpoint)
// @access  Private
router.get('/user/my-properties', protect, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ properties });
  } catch (error) {
    console.error('User properties fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user properties' });
  }
});

// @route   GET /api/properties/facilities/list
// @desc    Get list of available facilities
// @access  Private
router.get('/facilities/list', protect, (req, res) => {
  const facilities = Property.getFacilitiesList();
  res.json({ facilities });
});

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name phone email role')
      .lean();

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment views
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ property });
  } catch (error) {
    console.error('Property fetch error:', error);
    res.status(500).json({ message: 'Server error fetching property' });
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private
router.post('/', protect, authorize('homeowner', 'broker'), upload.array('images', 10), [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('propertyType')
    .isIn(['PG', 'house', 'flat'])
    .withMessage('Property type must be PG, house, or flat'),
  body('rent')
    .isNumeric()
    .withMessage('Rent must be a number'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.area')
    .trim()
    .notEmpty()
    .withMessage('Area is required'),
  body('location.pinCode')
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit pin code'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
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

    const propertyData = {
      ...req.body,
      owner: req.user._id,
      facilities: JSON.parse(req.body.facilities || '{}'),
      propertyDetails: JSON.parse(req.body.propertyDetails || '{}'),
      contactInfo: JSON.parse(req.body.contactInfo || '{}')
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        caption: ''
      }));
    }

    const property = new Property(propertyData);
    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate('owner', 'name phone email role');

    res.status(201).json({
      message: 'Property created successfully',
      property: populatedProperty
    });
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({ message: 'Server error creating property' });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private
router.put('/:id', protect, checkPropertyOwnership, upload.array('images', 10), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('propertyType')
    .optional()
    .isIn(['PG', 'house', 'flat'])
    .withMessage('Property type must be PG, house, or flat'),
  body('rent')
    .optional()
    .isNumeric()
    .withMessage('Rent must be a number')
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

    const updateData = { ...req.body };

    // Handle facilities and other JSON fields
    if (req.body.facilities) {
      updateData.facilities = JSON.parse(req.body.facilities);
    }
    if (req.body.propertyDetails) {
      updateData.propertyDetails = JSON.parse(req.body.propertyDetails);
    }
    if (req.body.contactInfo) {
      updateData.contactInfo = JSON.parse(req.body.contactInfo);
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        caption: ''
      }));

      // Keep existing images and add new ones
      const existingImages = req.property.images || [];
      updateData.images = [...existingImages, ...newImages];
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name phone email role');

    res.json({
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    console.error('Property update error:', error);
    res.status(500).json({ message: 'Server error updating property' });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private
router.delete('/:id', protect, checkPropertyOwnership, async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Property deletion error:', error);
    res.status(500).json({ message: 'Server error deleting property' });
  }
});

// @route   PATCH /api/properties/:id/toggle-availability
// @desc    Toggle property availability (list/delist)
// @access  Private
router.patch('/:id/toggle-availability', protect, checkPropertyOwnership, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Toggle availability
    property.isAvailable = !property.isAvailable;
    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate('owner', 'name phone email role');

    res.json({
      message: property.isAvailable ? 'Property listed successfully' : 'Property delisted successfully',
      property: populatedProperty
    });
  } catch (error) {
    console.error('Property availability toggle error:', error);
    res.status(500).json({ message: 'Server error toggling property availability' });
  }
});

// @route   PATCH /api/properties/:id/list
// @desc    List property (make available)
// @access  Private
router.patch('/:id/list', protect, checkPropertyOwnership, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isAvailable: true },
      { new: true, runValidators: true }
    ).populate('owner', 'name phone email role');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({
      message: 'Property listed successfully',
      property
    });
  } catch (error) {
    console.error('Property listing error:', error);
    res.status(500).json({ message: 'Server error listing property' });
  }
});

// @route   PATCH /api/properties/:id/delist
// @desc    Delist property (make unavailable)
// @access  Private
router.patch('/:id/delist', protect, checkPropertyOwnership, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isAvailable: false },
      { new: true, runValidators: true }
    ).populate('owner', 'name phone email role');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({
      message: 'Property delisted successfully',
      property
    });
  } catch (error) {
    console.error('Property delisting error:', error);
    res.status(500).json({ message: 'Server error delisting property' });
  }
});

// @route   GET /api/properties/public
// @desc    Get all properties with limited view (public access)
// @access  Public
router.get('/public', [
  query('city').optional().trim(),
  query('area').optional().trim(),
  query('pinCode').optional().trim(),
  query('propertyType').optional().isIn(['PG', 'house', 'flat']),
  query('minRent').optional().isNumeric(),
  query('maxRent').optional().isNumeric(),
  query('page').optional().isNumeric(),
  query('limit').optional().isNumeric(),
  query('sortBy').optional().isIn(['rent', 'createdAt', 'views']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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
      city,
      area,
      pinCode,
      propertyType,
      minRent,
      maxRent,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (area) filter['location.area'] = new RegExp(area, 'i');
    if (pinCode) filter['location.pinCode'] = pinCode;
    if (propertyType) filter.propertyType = propertyType;
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = parseInt(minRent);
      if (maxRent) filter.rent.$lte = parseInt(maxRent);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with limited fields for public view
    const properties = await Property.find(filter)
      .populate('owner', 'name role')
      .select('title propertyType location.city images owner views createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    // Increment views for public users
    properties.forEach(async (property) => {
      await Property.findByIdAndUpdate(property._id, { $inc: { views: 1 } });
    });

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Public properties fetch error:', error);
    res.status(500).json({ message: 'Server error fetching properties' });
  }
});

// @route   GET /api/properties/public/featured
// @desc    Get featured properties with limited view (public access)
// @access  Public
router.get('/public/featured', async (req, res) => {
  try {
    const properties = await Property.find({ 
      isAvailable: true, 
      isVerified: true 
    })
      .populate('owner', 'name role')
      .select('title propertyType location.city images owner views createdAt')
      .sort({ views: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ properties });
  } catch (error) {
    console.error('Featured properties fetch error:', error);
    res.status(500).json({ message: 'Server error fetching featured properties' });
  }
});

module.exports = router; 