import express from 'express';
import { loginUser, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;