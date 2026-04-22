const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

require('dotenv').config();

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_response', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ individualId: 'admin' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      // Update password to ensure it's "admin"
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      await User.updateOne(
        { individualId: 'admin' },
        { 
          password: hashedPassword,
          role: 'admin',
          active: true
        }
      );
      console.log('🔄 Updated admin user password to "admin"');
    } else {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      const adminUser = new User({
        individualId: 'admin',
        name: 'System Administrator',
        email: 'admin@resq.com',
        phone: '+911234567890',
        role: 'admin',
        password: 'admin',
        active: true,
        location: {
          lat: 28.6139,
          lng: 77.2090
        }
      });

      await adminUser.save();
      console.log('✅ Created admin user with credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin');
    }

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the seed function
seedAdmin();
