import asyncHandler from 'express-async-handler';
import { query } from '../config/db.js';
import { comparePassword } from '../utils/bcrypt.helpers.js';
import { generateToken } from '../utils/jwt.helpers.js';

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

  if (result.rows.length === 0) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];

  if (await comparePassword(password, user.password_hash)) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      specialty: user.specialty,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});