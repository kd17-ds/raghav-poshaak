const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { AuthMiddleware } = require("../middlewares/AuthMiddleware");

// Public Routes
router.post("/signup", AuthController.SignUp);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerification);
router.post("/login", AuthController.Login);
router.post("/forgot-password", AuthController.ForgotPass);
router.post("/reset-password", AuthController.resetPassword);
router.post("/logout", AuthController.Logout);

// Protected Route
router.get("/me", AuthMiddleware, AuthController.getCurrentUser);

router.patch("/me/username", AuthMiddleware, AuthController.updateUsername);
router.patch("/me/name", AuthMiddleware, AuthController.updateName);
router.patch("/me/phone", AuthMiddleware, AuthController.updatePhone);
router.patch("/me/password", AuthMiddleware, AuthController.changePassword);
router.delete("/me", AuthMiddleware, AuthController.deleteAccount);

module.exports = router;
