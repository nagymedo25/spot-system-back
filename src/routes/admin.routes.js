import express from 'express';
import {
  getTeachers,
  addTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from '../controllers/admin.teachers.controller.js';
import { uploadAvatar } from '../controllers/upload.controller.js';
import { singleUpload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.route('/teachers').get(getTeachers).post(addTeacher);
router
  .route('/teachers/:id')
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

router.post('/uploads/avatar', singleUpload, uploadAvatar);

export default router;