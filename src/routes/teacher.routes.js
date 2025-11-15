import express from 'express';
import {
  getMyStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/teacher.students.controller.js';
import {
  getSingleReportForEdit,
  createOrUpdateReport,
  deleteReport,
  getAllStudentReports,
} from '../controllers/teacher.reports.controller.js';

const router = express.Router();

router.route('/students').get(getMyStudents).post(addStudent);
router.route('/students/:id').put(updateStudent).delete(deleteStudent);

// Get a list of all reports for a specific student (for teacher management view)
router.get('/reports/list', getAllStudentReports); 

// Get a single report (for current week or specific week) - used in CreateReport.jsx
router.get('/reports/single', getSingleReportForEdit); 

// Create/Update report (used in CreateReport.jsx)
router.post('/reports', createOrUpdateReport);

// Delete report (used in ManageReports.jsx)
router.route('/reports/:id').delete(deleteReport);


export default router;  