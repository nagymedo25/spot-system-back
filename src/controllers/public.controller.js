import asyncHandler from 'express-async-handler';
import { query } from '../config/db.js';

export const getPublicTeachers = asyncHandler(async (req, res) => {
  const result = await query(
    "SELECT id, name, specialty, avatar_url FROM users WHERE role = 'teacher' ORDER BY name ASC"
  );
  res.status(200).json(result.rows);
});

export const queryStudentReport = asyncHandler(async (req, res) => {
  const { teacher_id, student_code } = req.body;

  if (!teacher_id || !student_code) {
    res.status(400);
    throw new Error('Please provide teacher_id and student_code');
  }
  
  // NOTE: We are now retrieving the custom identifier (Week Name) from the week_start_date column.
  const result = await query(
    `SELECT r.id, r.title, r.data_json, CAST(r.week_start_date AS VARCHAR) AS report_identifier, r.updated_at
     FROM weekly_reports r
     JOIN students s ON r.student_id = s.id
     WHERE s.code = $1 AND s.teacher_id = $2
     ORDER BY r.updated_at DESC`, // Sort by last update date for the parent view.
    [student_code, teacher_id]
  );

  res.status(200).json(result.rows);
});