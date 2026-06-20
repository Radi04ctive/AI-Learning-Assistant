import express from "express";
import { body } from "express-validator";
import { register, login, getProfile, updateProfile, changePassword, logout, refresh } from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

const registerValidation = [
  body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

const refreshValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refreshValidation, refresh);
// Logout is public: it reads the bearer token from the header to blacklist its
// jti but must still succeed after the access token has expired.
router.post("/logout", logout);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

export default router;
