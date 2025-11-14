import express from 'express';
import {
  getPublicTeachers,
  queryStudentReport,
} from '../controllers/public.controller.js';

const router = express.Router();

router.get('/teachers', getPublicTeachers);
router.post('/query-report', queryStudentReport);

export default router;