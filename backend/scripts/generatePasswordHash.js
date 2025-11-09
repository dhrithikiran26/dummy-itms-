// Simple script to generate bcrypt password hash
// Usage: node scripts/generatePasswordHash.js <password>

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'test123';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this hash in your SQL INSERT statement.');
  })
  .catch(err => {
    console.error('Error generating hash:', err);
  });




