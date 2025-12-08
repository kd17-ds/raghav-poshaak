const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");

router.post("/signup", authController.SignUp);
router.get("/verify-email", authController.verifyEmail);

module.exports = router;
