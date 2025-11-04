/*
Usage:
  # Windows PowerShell
  $env:MONGODB_URI="<your-connection-string>"; node server/seeders/resetAdminPassword.js "email@example.com" "NewPassword123!"

  # macOS/Linux
  MONGODB_URI="<your-connection-string>" node server/seeders/resetAdminPassword.js "email@example.com" "NewPassword123!"

Notes:
- The script will update the password for the given email if the user exists.
- If the user does not exist, it will create a new admin user with that email and password.
- Password is hashed with bcrypt before saving.
*/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const User = require('../models/User');

async function run() {
  const [,, emailArg, passwordArg] = process.argv;

  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI environment variable is not set.');
    process.exit(1);
  }

  if (!emailArg || !passwordArg) {
    console.error('Usage: node server/seeders/resetAdminPassword.js <email> <newPassword>');
    process.exit(1);
  }

  const email = String(emailArg).toLowerCase().trim();
  const plainPassword = String(passwordArg);

  if (plainPassword.length < 8) {
    console.error('ERROR: Password must be at least 8 characters.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const hash = await bcrypt.hash(plainPassword, 10);

    const existing = await User.findOne({ email }).select('_id');
    if (existing) {
      await User.updateOne({ email }, { $set: { password: hash, role: 'admin' } });
      console.log(`Password updated for admin: ${email}`);
    } else {
      await User.create({ email, password: hash, role: 'admin' });
      console.log(`Admin user created: ${email}`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();

