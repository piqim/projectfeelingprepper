// hash_pass.js
// Quick utility to hash passwords with bcrypt
// Usage: node hash_pass.js

import bcrypt from 'bcrypt';

async function hashPassword(plainText) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainText, saltRounds);
    
    console.log('\n========================================');
    console.log('✅ Password Hashing Utility');
    console.log('========================================');
    console.log('Plain text password:', plainText);
    console.log('----------------------------------------');
    console.log('Hashed password (copy this):');
    console.log(hash);
    console.log('========================================\n');
    console.log('💡 Use this in MongoDB:');
    console.log(`db.users.updateOne(`);
    console.log(`  { email: "your-email@example.com" },`);
    console.log(`  { $set: { password: "${hash}" } }`);
    console.log(`)`);
    console.log('========================================\n');
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

// Example passwords to hash
const passwordsToHash = [
  'password123',
  // Add your passwords here
];

// Hash all passwords
console.log('Hashing passwords...\n');
for (const password of passwordsToHash) {
  await hashPassword(password);
}

// Or hash a single password:
// hashPassword('your-password-here');