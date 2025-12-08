const User = require("../models/UserModel");
const Token = require("../models/TokenModel");
const sendRes = require("../utils/sendRes");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

// Registration Controller
module.exports.SignUp = async (req, res) => {
  try {
    const { username, email, password, phone, name } = req.body;

    if (!username || !email || !password || !name) {
      return sendRes(res, 400, false, "All required fields are not provided");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return sendRes(res, 400, false, "User already exists with this email");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return sendRes(res, 400, false, "Username already taken");
    }

    const newUser = await User.create({
      username,
      email,
      password,
      phone,
      name,
    });

    // Create a secure random token (raw) and store its SHA-256 hash in DB
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await Token.create({
      userId: newUser._id,
      tokenHash,
      type: "email_verify",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendVerificationEmail(email, {
        userId: newUser._id.toString(),
        token: rawToken,
      });
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr);

      return sendRes(
        res,
        500,
        false,
        "Registration succeeded but failed to send verification email. Please contact support."
      );
    }

    return sendRes(
      res,
      201,
      true,
      "User registered successfully. Please verify your email.",
      {
        userId: newUser._id,
      }
    );
  } catch (error) {
    console.error("SignUp error:", error);
    return sendRes(res, 500, false, "Internal server error");
  }
};

// Email Verification Controller
module.exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    const userId = req.query.id;

    if (!token || !userId) {
      return sendRes(
        res,
        400,
        false,
        "Invalid request. Token and user id are required."
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenDoc = await Token.findOne({
      userId,
      tokenHash,
      type: "email_verify",
    });

    if (!tokenDoc) {
      return sendRes(res, 400, false, "Invalid or expired verification link.");
    }

    // already used?
    if (tokenDoc.used) {
      return sendRes(
        res,
        400,
        false,
        "Verification link has already been used."
      );
    }

    // expired?
    if (tokenDoc.expiresAt.getTime() < Date.now()) {
      return sendRes(
        res,
        400,
        false,
        "Verification link has expired. Please request a new one."
      );
    }

    // Mark token used and set consumedAt
    tokenDoc.used = true;
    tokenDoc.consumedAt = new Date();
    await tokenDoc.save();

    // Set user as verified (only if not already)
    const user = await User.findById(userId);
    if (!user) {
      return sendRes(res, 404, false, "User not found.");
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    return sendRes(res, 200, true, "Email verified successfully.");
  } catch (err) {
    console.error("verifyEmail error:", err);
    return sendRes(res, 500, false, "Internal server error");
  }
};

// Resend Verification Email Controller
module.exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendRes(res, 400, false, "Email required.");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendRes(res, 404, false, "User not found.");

    if (user.isVerified)
      return sendRes(res, 400, false, "User already verified.");

    // Cooldown: only allow a resend every 3 minutes
    const recent = await Token.findOne({
      userId: user._id,
      type: "email_verify",
      createdAt: { $gt: new Date(Date.now() - 3 * 60 * 1000) },
    });
    if (recent) {
      return sendRes(
        res,
        429,
        false,
        "Verification email was sent recently. Try again in 3 minutes."
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await Token.create({
      userId: user._id,
      tokenHash,
      type: "email_verify",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendVerificationEmail(user.email, {
        userId: user._id.toString(),
        token: rawToken,
      });
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr);

      return sendRes(
        res,
        500,
        false,
        "Verification email failed to send. Please contact support."
      );
    }

    return sendRes(res, 200, true, "Verification email sent.", {
      userId: user._id,
    });
  } catch (error) {
    console.error("resendVerification error:", error);
    return sendRes(res, 500, false, "Internal server error");
  }
};
