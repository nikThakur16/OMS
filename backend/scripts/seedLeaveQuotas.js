const mongoose = require('mongoose');
const LeaveQuota = require('../models/LeaveQuota');
const User = require('../models/User');
const LeaveType = require('../models/LeaveType');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedLeaveQuotas() {
  try {
    console.log('🌱 Seeding leave quotas...');
    
    // Get all users and leave types
    const users = await User.find({});
    const leaveTypes = await LeaveType.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }
    
    if (leaveTypes.length === 0) {
      console.log('❌ No leave types found. Please run seedLeaveTypes.js first.');
      return;
    }
    
    // Clear existing quotas
    await LeaveQuota.deleteMany({});
    console.log('✅ Cleared existing leave quotas');
    
    const currentYear = new Date().getFullYear();
    const quotas = [];
    
    // Create quotas for each user
    for (const user of users) {
      for (const leaveType of leaveTypes) {
        let total = 0;
        
        // Set different quotas based on leave type
        switch (leaveType.name) {
          case 'Annual Leave':
            total = 21;
            break;
          case 'Sick Leave':
            total = 10;
            break;
          case 'Casual Leave':
            total = 7;
            break;
          case 'Maternity Leave':
            total = 90;
            break;
          case 'Paternity Leave':
            total = 14;
            break;
          case 'Bereavement Leave':
            total = 5;
            break;
          case 'Study Leave':
            total = 10;
            break;
          default:
            total = 5;
        }
        
        quotas.push({
          user: user._id,
          leaveType: leaveType._id,
          year: currentYear,
          total: total,
          used: 0
        });
      }
    }
    
    // Insert quotas
    const createdQuotas = await LeaveQuota.insertMany(quotas);
    console.log(`✅ Successfully seeded ${createdQuotas.length} leave quotas for ${users.length} users`);
    
    // Show summary
    console.log('\n📊 Leave Quotas Summary:');
    for (const leaveType of leaveTypes) {
      const quotaForType = quotas.find(q => q.leaveType.toString() === leaveType._id.toString());
      console.log(`   - ${leaveType.name}: ${quotaForType?.total || 0} days per user`);
    }
    
    console.log('\n🎉 Leave quotas seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding leave quotas:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedLeaveQuotas(); 