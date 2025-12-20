import express from 'express';
import { createUser, forgotPassword, getUserById, getUsers, loginusers, logoutUser, resetPassword, uploadProfilePhoto } from '../controllers/user.js'
import auth from "../middleware/auth.js";
import { upload } from '../middleware/upload.js';
const router = express.Router();

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - mobile
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/create', createUser);


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 userdata:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64f1c2b2a4e5f1234567890a
 *                     name:
 *                       type: string
 *                       example: Test User
 *                     email:
 *                       type: string
 *                       example: test@gmail.com
 *                     mobile:
 *                       type: string
 *                       example: 1234567890
 */

router.post('/login', loginusers);



/**
 * @swagger
 * /api/users/get:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/get', auth, getUsers);


/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user info by ID (public, no token required)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully fetched user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f1c2b2a4e5f1234567890a
 *                     name:
 *                       type: string
 *                       example: Test User
 *                     email:
 *                       type: string
 *                       example: test@gmail.com
 *                     mobile:
 *                       type: string
 *                       example: 1234567890
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
 */
router.get('/:id', getUserById);


/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user by invalidating JWT token (blacklist)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       401:
 *         description: Unauthorized or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token expired. Please login again
 */
router.post("/logout", auth, logoutUser);


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *     responses:
 *       200:
 *         description: OTP generated or sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to email
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *       400:
 *         description: Email missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.post("/forgot-password", forgotPassword);



/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using email OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: new123
 *               confirmPassword:
 *                 type: string
 *                 example: new123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password has been updated successfully
 *       400:
 *         description: Validation error (fields missing, OTP wrong/expired, mismatch)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP wrong
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.post("/reset-password", resetPassword);




/**
 * @swagger
 * /api/users/upload-profile/{id}:
 *   put:
 *     summary: Upload user profile photo
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *       400:
 *         description: No image uploaded
 *       404:
 *         description: User not found
 */


router.put(
  "/upload-profile/:id",
  upload.single("profilePhoto"),
  uploadProfilePhoto
);

export default router;
