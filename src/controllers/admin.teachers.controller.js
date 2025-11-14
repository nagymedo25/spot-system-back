import asyncHandler from 'express-async-handler';
import { query } from '../config/db.js';
import { hashPassword } from '../utils/bcrypt.helpers.js';

export const getTeachers = asyncHandler(async (req, res) => {
  const result = await query(
    "SELECT id, name, email, specialty, avatar_url, created_at FROM users WHERE role = 'teacher' ORDER BY created_at DESC"
  );
  res.status(200).json(result.rows);
});

export const addTeacher = asyncHandler(async (req, res) => {
  const { name, specialty, email, password, avatar_url } = req.body;

  if (!name || !email || !password || !specialty) {
    res.status(400);
    throw new Error('Please provide name, email, password, and specialty');
  }

  const emailLower = email.toLowerCase();
  const userExists = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
  if (userExists.rows.length > 0) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hashPassword(password);
  
  const result = await query(
    'INSERT INTO users (name, email, password_hash, role, specialty, avatar_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, specialty, avatar_url',
    [name, emailLower, hashedPassword, 'teacher', specialty, avatar_url || null]
  );

  res.status(201).json(result.rows[0]);
});

export const getTeacherById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await query(
    "SELECT id, name, email, specialty, avatar_url FROM users WHERE id = $1 AND role = 'teacher'",
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.status(200).json(result.rows[0]);
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, specialty, email, avatar_url } = req.body;

  const result = await query(
    'UPDATE users SET name = $1, specialty = $2, email = $3, avatar_url = $4 WHERE id = $5 AND role = $6 RETURNING id, name, email, role, specialty, avatar_url',
    [name, specialty, email.toLowerCase(), avatar_url, id, 'teacher']
  );

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.status(200).json(result.rows[0]);
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'teacher']);

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  
  res.status(200).json({ message: 'Teacher removed successfully' });
});