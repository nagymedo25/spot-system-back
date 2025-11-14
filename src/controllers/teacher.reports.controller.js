import asyncHandler from 'express-async-handler';
import { query } from '../config/db.js';

export const getReportsByStudent = asyncHandler(async (req, res) => {
  const { student_id, week_start } = req.query;
  const teacherId = req.user.id;

  if (!student_id || !week_start) {
    res.status(400);
    throw new Error('Missing student_id or week_start parameters');
  }

  const result = await query(
    'SELECT * FROM weekly_reports WHERE student_id = $1 AND teacher_id = $2 AND week_start_date = $3',
    [student_id, teacherId, week_start]
  );

  res.status(200).json(result.rows);
});

export const createOrUpdateReport = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const { student_id, week_start_date, title, data_json, report_id } = req.body;

  if (!student_id || !week_start_date || !data_json) {
    res.status(400);
    throw new Error('Missing required report data');
  }

  if (report_id) {
    const result = await query(
      'UPDATE weekly_reports SET title = $1, data_json = $2, week_start_date = $3 WHERE id = $4 AND teacher_id = $5 RETURNING *',
      [title, data_json, week_start_date, report_id, teacherId]
    );
    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Report not found or not authorized');
    }
    res.status(200).json(result.rows[0]);
  } else {
    const result = await query(
      'INSERT INTO weekly_reports (teacher_id, student_id, title, data_json, week_start_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [teacherId, student_id, title, data_json, week_start_date]
    );
    res.status(201).json(result.rows[0]);
  }
});

export const deleteReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user.id;

    const result = await query('DELETE FROM weekly_reports WHERE id = $1 AND teacher_id = $2', [id, teacherId]);

    if (result.rowCount === 0) {
        res.status(404);
        throw new Error('Report not found or not authorized');
    }

    res.status(200).json({ message: 'Report deleted successfully' });
});