import express from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import teacherRoutes from './teacher.routes.js';
import publicRoutes from './public.routes.js';
import { protect } from '../middlewares/auth.middleware.js';
import { admin, teacher } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', protect, admin, adminRoutes);
router.use('/teacher', protect, teacher, teacherRoutes);

export default router;