const mongoose = require('mongoose');
const Property = require('../models/Property');
require('dotenv').config();

async function testPropertyManagement() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nestconnect');
    console.log('✅ Connected to MongoDB');

    // Get all properties
    const properties = await Property.find({});
    console.log(`Found ${properties.length} properties`);

    if (properties.length === 0) {
      console.log('❌ No properties found. Please run addSampleProperties.js first.');
      return;
    }

    // Test 1: Show current status
    console.log('\n📊 Current Property Status:');
    properties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.title} - ${property.isAvailable ? 'Listed' : 'Delisted'} (${property.views || 0} views)`);
    });

    // Test 2: Delist first property
    const firstProperty = properties[0];
    console.log(`\n🔄 Delisting property: ${firstProperty.title}`);
    firstProperty.isAvailable = false;
    await firstProperty.save();
    console.log('✅ Property delisted successfully');

    // Test 3: List the same property
    console.log(`\n🔄 Listing property: ${firstProperty.title}`);
    firstProperty.isAvailable = true;
    await firstProperty.save();
    console.log('✅ Property listed successfully');

    // Test 4: Show final status
    const updatedProperties = await Property.find({});
    console.log('\n📊 Final Property Status:');
    updatedProperties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.title} - ${property.isAvailable ? 'Listed' : 'Delisted'} (${property.views || 0} views)`);
    });

    console.log('\n🎉 Property management test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing property management:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testPropertyManagement(); 