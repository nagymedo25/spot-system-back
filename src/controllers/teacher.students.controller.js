import asyncHandler from 'express-async-handler';
import { query } from '../config/db.js';

export const getMyStudents = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const result = await query(
    'SELECT id, code, name, created_at FROM students WHERE teacher_id = $1 ORDER BY name ASC',
    [teacherId]
  );
  res.status(200).json(result.rows);
});

export const addStudent = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const { code, name } = req.body;

  if (!code || !name) {
    res.status(400);
    throw new Error('Please provide student code and name');
  }

  const codeExists = await query('SELECT id FROM students WHERE teacher_id = $1 AND code = $2', [teacherId, code]);
  if (codeExists.rows.length > 0) {
    res.status(400);
    throw new Error('A student with this code already exists for you');
  }

  const result = await query(
    'INSERT INTO students (teacher_id, code, name) VALUES ($1, $2, $3) RETURNING id, code, name, teacher_id',
    [teacherId, code, name]
  );
  
  res.status(201).json(result.rows[0]);
});

export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, name } = req.body;
  const teacherId = req.user.id;

  const codeCheck = await query('SELECT id FROM students WHERE teacher_id = $1 AND code = $2 AND id != $3', [teacherId, code, id]);
  if (codeCheck.rows.length > 0) {
    res.status(400);
    throw new Error('Another student with this code already exists');
  }

  const result = await query(
    'UPDATE students SET code = $1, name = $2 WHERE id = $3 AND teacher_id = $4 RETURNING id, code, name',
    [code, name, id, teacherId]
  );

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Student not found or you are not authorized');
  }
  res.status(200).json(result.rows[0]);
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacherId = req.user.id;

  const result = await query('DELETE FROM students WHERE id = $1 AND teacher_id = $2', [id, teacherId]);

  if (result.rowCount === 0) {
    res.status(404);
    throw new Error('Student not found or you are not authorized');
  }
  
  res.status(200).json({ message: 'Student removed successfully' });
});