import asyncHandler from 'express-async-handler';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer);
    res.status(201).json({
      message: 'Image uploaded successfully',
      avatar_url: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Failed to upload image to Cloudinary');
  }
});