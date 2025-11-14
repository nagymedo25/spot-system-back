import { query } from './db.js';
import { hashPassword } from '../utils/bcrypt.helpers.js';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@spot.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminSpot123';

export const createAdminAccount = async () => {
  try {
    const adminExists = await query('SELECT id FROM users WHERE email = $1 AND role = $2', [ADMIN_EMAIL, 'admin']);

    if (adminExists.rows.length === 0) {
      console.log('Admin account not found. Creating new admin...');
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);
      
      await query(
        'INSERT INTO users (name, email, password_hash, role, specialty) VALUES ($1, $2, $3, $4, $5)',
        ['Admin User', ADMIN_EMAIL, hashedPassword, 'admin', 'System Administrator']
      );
      console.log(`Admin account created successfully with email: ${ADMIN_EMAIL}`);
    } else {
      console.log('Admin account already exists.');
    }
  } catch (error) {
    console.error('Error during admin account initialization:', error);
    process.exit(1);
  }
};