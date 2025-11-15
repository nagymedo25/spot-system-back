import asyncHandler from 'express-async-handler';
import { query } from '../config/db.js';

// ----------------------------------------------------------------------------------------------------------------------
// NEW ENDPOINT: Get a list of all reports (id, title, report_identifier) for a specific student (for teacher management)
export const getAllStudentReports = asyncHandler(async (req, res) => {
  const { student_id } = req.query;
  const teacherId = req.user.id;

  if (!student_id) {
    res.status(400);
    throw new Error('Missing student_id parameter');
  }

  // NOTE: Retrieving the custom identifier (Week Name) from the week_start_date column using explicit CAST to VARCHAR.
  const result = await query(
    `SELECT id, title, CAST(week_start_date AS VARCHAR) AS report_identifier, updated_at
     FROM weekly_reports
     WHERE student_id = $1 AND teacher_id = $2
     ORDER BY updated_at DESC`, // Sort by last update date, as there is no true date field anymore.
    [student_id, teacherId]
  );

  res.status(200).json(result.rows);
});


// MODIFIED ENDPOINT: Get a single report by report_id (for teacher edit/view)
export const getSingleReportForEdit = asyncHandler(async (req, res) => {
  const { report_id } = req.query; // Now fetching by report ID only

  if (!report_id) {
    return res.status(200).json([]);
  }
  
  const teacherId = req.user.id;

  // Fetch report by its unique ID
  const result = await query(
    `SELECT id, title, data_json, CAST(week_start_date AS VARCHAR) AS report_identifier
     FROM weekly_reports 
     WHERE id = $1 AND teacher_id = $2`,
    [report_id, teacherId]
  );

  res.status(200).json(result.rows);
});

// MODIFIED ENDPOINT: Create or Update Report - FINAL FIX for "invalid input syntax for type date"
export const createOrUpdateReport = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const { student_id, report_identifier, title, data_json, report_id } = req.body;

  if (!student_id || !report_identifier || !data_json) {
    res.status(400);
    throw new Error('Missing required report data (student_id, report_identifier, data_json)');
  }

  // --- Logic to check for identifier uniqueness before creating a NEW report ---
  if (!report_id) {
    // Check if an existing report uses the same identifier for this student.
    const checkResult = await query(
      `SELECT id FROM weekly_reports WHERE student_id = $1 AND teacher_id = $2 AND CAST(week_start_date AS VARCHAR) = $3`,
      [student_id, teacherId, report_identifier]
    );

    if (checkResult.rows.length > 0) {
      res.status(400);
      throw new Error('Report identifier already exists for this student. Please choose a different name or edit the existing report.');
    }
  }

  if (report_id) {
    // Update existing report by ID
    const result = await query(
      // FINAL FIX: Use $3::TEXT to explicitly hint the type to the driver/Postgres as text
      `UPDATE weekly_reports 
       SET title = $1, data_json = $2, week_start_date = $3::TEXT 
       WHERE id = $4 AND teacher_id = $5 
       RETURNING id, title, data_json, CAST(week_start_date AS VARCHAR) AS report_identifier`,
      [title, data_json, report_identifier, report_id, teacherId]
    );
    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Report not found or not authorized');
    }
    res.status(200).json(result.rows[0]);
  } else {
    // Create new report
    const result = await query(
      // FINAL FIX: Use $5::TEXT to explicitly hint the type to the driver/Postgres as text
      `INSERT INTO weekly_reports (teacher_id, student_id, title, data_json, week_start_date) 
       VALUES ($1, $2, $3, $4, $5::TEXT) 
       RETURNING id, title, data_json, CAST(week_start_date AS VARCHAR) AS report_identifier`,
      [teacherId, student_id, title, data_json, report_identifier]
    );
    res.status(201).json(result.rows[0]);
  }
});

// EXISTING ENDPOINT: Delete Report (unchanged)
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