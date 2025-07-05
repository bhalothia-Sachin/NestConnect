const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
require('dotenv').config();

// Sample image URLs (you can replace these with actual uploaded images)
const sampleImages = [
  {
    url: '/uploads/sample-property-1-1.jpg',
    caption: 'Living Room'
  },
  {
    url: '/uploads/sample-property-1-2.jpg',
    caption: 'Kitchen'
  },
  {
    url: '/uploads/sample-property-1-3.jpg',
    caption: 'Bedroom'
  },
  {
    url: '/uploads/sample-property-1-4.jpg',
    caption: 'Bathroom'
  }
];

const sampleProperties = [
  {
    title: 'Modern 2BHK Flat in City Center',
    description: 'Beautiful 2-bedroom apartment with modern amenities, located in the heart of the city. Perfect for young professionals or small families. Features include a fully equipped kitchen, spacious living room, and two well-appointed bedrooms.',
    propertyType: 'flat',
    rent: 25000,
    rentType: 'monthly',
    location: {
      city: 'Mumbai',
      area: 'Bandra West',
      pinCode: '400050',
      address: '15th Floor, Sunshine Tower, Linking Road'
    },
    facilities: {
      wifi: true,
      parking: true,
      ac: true,
      kitchen: true,
      laundry: false,
      security: true,
      gym: true,
      pool: false,
      garden: false,
      balcony: true,
      furnished: true,
      petFriendly: false
    },
    propertyDetails: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      floor: 15,
      totalFloors: 20
    },
    images: sampleImages,
    contactInfo: {
      showPhone: true,
      showEmail: false
    },
    showOnMap: true,
    isAvailable: true,
    isVerified: true
  },
  {
    title: 'Cozy PG for Students',
    description: 'Comfortable paying guest accommodation perfect for students. Located near educational institutions with easy access to public transport. Includes meals and basic amenities.',
    propertyType: 'PG',
    rent: 12000,
    rentType: 'monthly',
    location: {
      city: 'Delhi',
      area: 'Hauz Khas',
      pinCode: '110016',
      address: 'Block A, Student Colony, Near Delhi University'
    },
    facilities: {
      wifi: true,
      parking: true,
      ac: true,
      kitchen: true,
      laundry: true,
      security: true,
      gym: false,
      pool: false,
      garden: false,
      balcony: false,
      furnished: true,
      petFriendly: false
    },
    propertyDetails: {
      bedrooms: 1,
      bathrooms: 1,
      area: 300,
      floor: 2,
      totalFloors: 4
    },
    images: [
      { url: '/uploads/sample-pg-1.jpg', caption: 'Room' },
      { url: '/uploads/sample-pg-2.jpg', caption: 'Common Area' },
      { url: '/uploads/sample-pg-3.jpg', caption: 'Kitchen' }
    ],
    contactInfo: {
      showPhone: true,
      showEmail: true
    },
    showOnMap: true,
    isAvailable: true,
    isVerified: true
  },
  {
    title: 'Spacious 3BHK House with Garden',
    description: 'Beautiful 3-bedroom house with a private garden, perfect for families. Located in a quiet residential area with excellent connectivity. Features include a modern kitchen, spacious living areas, and a beautiful garden.',
    propertyType: 'house',
    rent: 45000,
    rentType: 'monthly',
    location: {
      city: 'Bangalore',
      area: 'Indiranagar',
      pinCode: '560038',
      address: '15th Cross, 8th Main, Near Metro Station'
    },
    facilities: {
      wifi: true,
      parking: true,
      ac: true,
      kitchen: true,
      laundry: true,
      security: true,
      gym: false,
      pool: false,
      garden: true,
      balcony: true,
      furnished: false,
      petFriendly: true
    },
    propertyDetails: {
      bedrooms: 3,
      bathrooms: 3,
      area: 2000,
      floor: 1,
      totalFloors: 2
    },
    images: [
      { url: '/uploads/sample-house-1.jpg', caption: 'Exterior View' },
      { url: '/uploads/sample-house-2.jpg', caption: 'Living Room' },
      { url: '/uploads/sample-house-3.jpg', caption: 'Master Bedroom' },
      { url: '/uploads/sample-house-4.jpg', caption: 'Garden' },
      { url: '/uploads/sample-house-5.jpg', caption: 'Kitchen' }
    ],
    contactInfo: {
      showPhone: true,
      showEmail: false
    },
    showOnMap: true,
    isAvailable: true,
    isVerified: true
  },
  {
    title: 'Luxury 1BHK Flat with Pool',
    description: 'Premium 1-bedroom apartment in a luxury complex with swimming pool and gym. Perfect for executives or couples. Features high-end amenities and 24/7 security.',
    propertyType: 'flat',
    rent: 35000,
    rentType: 'monthly',
    location: {
      city: 'Hyderabad',
      area: 'Banjara Hills',
      pinCode: '500034',
      address: 'Tower 3, Luxury Heights, Road No. 12'
    },
    facilities: {
      wifi: true,
      parking: true,
      ac: true,
      kitchen: true,
      laundry: true,
      security: true,
      gym: true,
      pool: true,
      garden: true,
      balcony: true,
      furnished: true,
      petFriendly: false
    },
    propertyDetails: {
      bedrooms: 1,
      bathrooms: 2,
      area: 800,
      floor: 12,
      totalFloors: 25
    },
    images: [
      { url: '/uploads/sample-luxury-1.jpg', caption: 'Living Area' },
      { url: '/uploads/sample-luxury-2.jpg', caption: 'Bedroom' },
      { url: '/uploads/sample-luxury-3.jpg', caption: 'Swimming Pool' },
      { url: '/uploads/sample-luxury-4.jpg', caption: 'Gym' },
      { url: '/uploads/sample-luxury-5.jpg', caption: 'Balcony View' },
      { url: '/uploads/sample-luxury-6.jpg', caption: 'Kitchen' }
    ],
    contactInfo: {
      showPhone: false,
      showEmail: true
    },
    showOnMap: true,
    isAvailable: true,
    isVerified: true
  },
  {
    title: 'Budget-Friendly PG near Metro',
    description: 'Affordable paying guest accommodation located just 5 minutes walk from the metro station. Perfect for students and working professionals on a budget.',
    propertyType: 'PG',
    rent: 8000,
    rentType: 'monthly',
    location: {
      city: 'Chennai',
      area: 'Anna Nagar',
      pinCode: '600040',
      address: 'Block 5, Near Anna Nagar Metro Station'
    },
    facilities: {
      wifi: true,
      parking: false,
      ac: false,
      kitchen: true,
      laundry: true,
      security: true,
      gym: false,
      pool: false,
      garden: false,
      balcony: false,
      furnished: true,
      petFriendly: false
    },
    propertyDetails: {
      bedrooms: 1,
      bathrooms: 1,
      area: 250,
      floor: 1,
      totalFloors: 3
    },
    images: [
      { url: '/uploads/sample-budget-1.jpg', caption: 'Room' },
      { url: '/uploads/sample-budget-2.jpg', caption: 'Common Kitchen' }
    ],
    contactInfo: {
      showPhone: true,
      showEmail: false
    },
    showOnMap: true,
    isAvailable: true,
    isVerified: false
  }
];

async function addSampleProperties() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a homeowner user to assign properties to
    const homeowner = await User.findOne({ role: 'homeowner' });
    if (!homeowner) {
      console.log('No homeowner found. Please create a homeowner user first.');
      return;
    }

    // Clear existing sample properties (optional)
    // await Property.deleteMany({ owner: homeowner._id });

    // Add sample properties
    for (const propertyData of sampleProperties) {
      const property = new Property({
        ...propertyData,
        owner: homeowner._id
      });
      
      await property.save();
      console.log(`Added property: ${property.title}`);
    }

    console.log('Sample properties added successfully!');
    console.log(`Total properties for ${homeowner.name}: ${await Property.countDocuments({ owner: homeowner._id })}`);

  } catch (error) {
    console.error('Error adding sample properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleProperties(); 