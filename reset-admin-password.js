// Reset Admin Password
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://admin:AbosefenMongo2024!@localhost:27017/abosefen-auth?authSource=admin';
const NEW_PASSWORD = 'Tmaher123@';

async function resetPassword() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db('abosefen-auth');
    const users = db.collection('users');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);
    console.log('✓ Password hashed');
    
    // Update admin user
    const result = await users.updateOne(
      { email: 'admin@abosefen.com' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount > 0) {
      console.log('✓ Admin password updated successfully!');
      console.log('');
      console.log('==========================================');
      console.log('  ADMIN LOGIN CREDENTIALS');
      console.log('==========================================');
      console.log('Email:    admin@abosefen.com');
      console.log('Password: admin123');
      console.log('==========================================');
    } else {
      console.log('✗ Admin user not found');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

resetPassword();

