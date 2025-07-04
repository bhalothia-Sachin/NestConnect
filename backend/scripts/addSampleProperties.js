const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
require('dotenv').config();

const sampleProperties = [
  {
    title: "Modern 2BHK Flat in City Center",
    description: "Beautiful 2-bedroom apartment with modern amenities, located in the heart of the city. Perfect for young professionals or small families. Features include a fully equipped kitchen, spacious living room, and balcony with city views.",
    propertyType: "flat",
    rent: 25000,
    rentType: "monthly",
    location: {
      city: "Mumbai",
      area: "Bandra West",
      pinCode: "400050",
      address: "15th Floor, Sunshine Tower, Linking Road",
      coordinates: {
        latitude: 19.0596,
        longitude: 72.8295
      }
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
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        caption: "Living Room"
      },
      {
        url: "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800",
        caption: "Kitchen"
      }
    ],
    isAvailable: true,
    isVerified: true,
    showOnMap: true,
    views: 45,
    contactInfo: {
      showPhone: true,
      showEmail: false
    }
  },
  {
    title: "Cozy PG for Students",
    description: "Comfortable paying guest accommodation perfect for students. Located near educational institutions with all basic amenities included. Safe and secure environment with 24/7 security.",
    propertyType: "PG",
    rent: 12000,
    rentType: "monthly",
    location: {
      city: "Delhi",
      area: "Dwarka",
      pinCode: "110075",
      address: "Block 12, Sector 10, Dwarka",
      coordinates: {
        latitude: 28.5642,
        longitude: 77.0589
      }
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
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        caption: "Bedroom"
      }
    ],
    isAvailable: true,
    isVerified: true,
    showOnMap: true,
    views: 23,
    contactInfo: {
      showPhone: true,
      showEmail: true
    }
  },
  {
    title: "Spacious 3BHK House with Garden",
    description: "Beautiful independent house with 3 bedrooms, large living area, and a private garden. Perfect for families looking for space and privacy. Located in a quiet residential area.",
    propertyType: "house",
    rent: 45000,
    rentType: "monthly",
    location: {
      city: "Bangalore",
      area: "Whitefield",
      pinCode: "560066",
      address: "123, Palm Grove Layout, Whitefield",
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
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
      area: 2500,
      floor: 1,
      totalFloors: 2
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        caption: "House Exterior"
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800",
        caption: "Living Room"
      }
    ],
    isAvailable: true,
    isVerified: true,
    showOnMap: true,
    views: 67,
    contactInfo: {
      showPhone: true,
      showEmail: false
    }
  },
  {
    title: "Luxury 1BHK Flat with Pool",
    description: "Premium 1-bedroom apartment in a luxury complex with swimming pool, gym, and other premium amenities. Perfect for executives or couples looking for a high-end lifestyle.",
    propertyType: "flat",
    rent: 35000,
    rentType: "monthly",
    location: {
      city: "Hyderabad",
      area: "Gachibowli",
      pinCode: "500032",
      address: "Tower A, Cyber Gateway, Gachibowli",
      coordinates: {
        latitude: 17.3850,
        longitude: 78.4867
      }
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
      area: 900,
      floor: 12,
      totalFloors: 25
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        caption: "Living Area"
      },
      {
        url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
        caption: "Swimming Pool"
      }
    ],
    isAvailable: true,
    isVerified: true,
    showOnMap: true,
    views: 89,
    contactInfo: {
      showPhone: true,
      showEmail: true
    }
  },
  {
    title: "Budget-Friendly PG near Metro",
    description: "Affordable paying guest accommodation located just 5 minutes walk from metro station. Clean rooms with basic amenities. Ideal for working professionals on a budget.",
    propertyType: "PG",
    rent: 8000,
    rentType: "monthly",
    location: {
      city: "Chennai",
      area: "Anna Nagar",
      pinCode: "600040",
      address: "45, 2nd Street, Anna Nagar East",
      coordinates: {
        latitude: 13.0827,
        longitude: 80.2707
      }
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
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        caption: "Room"
      }
    ],
    isAvailable: true,
    isVerified: false,
    showOnMap: true,
    views: 12,
    contactInfo: {
      showPhone: true,
      showEmail: false
    }
  }
];

async function addSampleProperties() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nestconnect');
    console.log('✅ Connected to MongoDB');

    // Get all homeowners
    const homeowners = await User.find({ role: 'homeowner' });
    console.log(`Found ${homeowners.length} homeowners`);

    if (homeowners.length === 0) {
      console.log('❌ No homeowners found. Please register some homeowners first.');
      return;
    }

    // Clear existing properties
    await Property.deleteMany({});
    console.log('🗑️ Cleared existing properties');

    // Add sample properties
    const addedProperties = [];
    
    for (let i = 0; i < sampleProperties.length; i++) {
      const propertyData = sampleProperties[i];
      const owner = homeowners[i % homeowners.length]; // Distribute properties among homeowners
      
      const property = new Property({
        ...propertyData,
        owner: owner._id
      });
      
      await property.save();
      addedProperties.push(property);
      console.log(`✅ Added property: ${property.title} (Owner: ${owner.name})`);
    }

    console.log(`\n🎉 Successfully added ${addedProperties.length} sample properties!`);
    console.log('\n📊 Summary:');
    console.log(`- Total properties: ${addedProperties.length}`);
    console.log(`- Available properties: ${addedProperties.filter(p => p.isAvailable).length}`);
    console.log(`- Verified properties: ${addedProperties.filter(p => p.isVerified).length}`);

  } catch (error) {
    console.error('❌ Error adding sample properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addSampleProperties(); 