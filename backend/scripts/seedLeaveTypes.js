const mongoose = require('mongoose');
const LeaveType = require('../models/LeaveType');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const defaultLeaveTypes = [
  {
    name: 'Annual Leave',
    description: 'Regular annual vacation leave',
    isActive: true
  },
  {
    name: 'Sick Leave',
    description: 'Medical and health-related leave',
    isActive: true
  },
  {
    name: 'Casual Leave',
    description: 'Short-term personal leave',
    isActive: true
  },
  {
    name: 'Maternity Leave',
    description: 'Leave for expecting mothers',
    isActive: true
  },
  {
    name: 'Paternity Leave',
    description: 'Leave for new fathers',
    isActive: true
  },
  {
    name: 'Bereavement Leave',
    description: 'Leave for family bereavement',
    isActive: true
  },
  {
    name: 'Study Leave',
    description: 'Leave for educational purposes',
    isActive: true
  }
];

async function seedLeaveTypes() {
  try {
    console.log('🌱 Seeding leave types...');
    
    // Clear existing leave types
    await LeaveType.deleteMany({});
    console.log('✅ Cleared existing leave types');
    
    // Insert default leave types
    const leaveTypes = await LeaveType.insertMany(defaultLeaveTypes);
    console.log(`✅ Successfully seeded ${leaveTypes.length} leave types:`);
    
    leaveTypes.forEach(type => {
      console.log(`   - ${type.name}: ${type.description}`);
    });
    
    console.log('\n🎉 Leave types seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding leave types:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedLeaveTypes(); 