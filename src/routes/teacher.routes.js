import express from 'express';
import {
  getMyStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/teacher.students.controller.js';
import {
  getReportsByStudent,
  createOrUpdateReport,
  deleteReport,
} from '../controllers/teacher.reports.controller.js';

const router = express.Router();

router.route('/students').get(getMyStudents).post(addStudent);
router.route('/students/:id').put(updateStudent).delete(deleteStudent);

router.route('/reports').get(getReportsByStudent).post(createOrUpdateReport);
router.route('/reports/:id').delete(deleteReport);


export default router;