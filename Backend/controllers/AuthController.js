const User = require("../models/UserModel");
const Token = require("../models/TokenModel");
const sendRes = require("../utils/sendRes");
const crypto = require("crypto");
const { generateSecretToken } = require("../utils/secretToken");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const forgotPassEmail = require("../utils/forgotPassEmail");
const { validatePassword } = require("../utils/validators");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Registration Controller
module.exports.SignUp = async (req, res) => {
  try {
    let { username, email, password, phone, name } = req.body;

    if (!username || !email || !password || !name) {
      return sendRes(res, 400, false, "All required fields are not provided");
    }

    if (email) email = email.toLowerCase().trim();
    if (username) username = username.trim();

    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      return sendRes(res, 400, false, pwCheck.reason);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return sendRes(
        res,
        400,
        false,
        "An account already exists with this email."
      );
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return sendRes(
        res,
        400,
        false,
        "This username is already taken. Try another one."
      );
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
      "Registration successful. A verification email has been sent — please check your inbox.",
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
    let { email } = req.body;
    if (!email) return sendRes(res, 400, false, "Email required.");

    if (email) email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user)
      return sendRes(
        res,
        200,
        true,
        "If an account exists for this email, a verification link has been sent. Please check your inbox."
      );

    if (user.isVerified)
      return sendRes(
        res,
        400,
        false,
        "Your email is already verified. You may log in"
      );

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

    return sendRes(
      res,
      200,
      true,
      "If an account exists for this email, a verification link has been sent. Please check your inbox.",
      {
        userId: user._id,
      }
    );
  } catch (error) {
    console.error("resendVerification error:", error);
    return sendRes(res, 500, false, "Internal server error");
  }
};

// Login Controller
module.exports.Login = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!password || (!username && !email)) {
      return sendRes(
        res,
        400,
        false,
        "Password and either username or email are required."
      );
    }

    if (email) email = email.toLowerCase().trim();
    if (username) username = username.trim();

    const query = email ? { email } : { username };
    const user = await User.findOne(query).select("+password");

    if (!user) {
      return sendRes(res, 401, false, "Invalid credentials.");
    }

    if (!user.isVerified) {
      return sendRes(
        res,
        403,
        false,
        "Email not verified. Please verify your email to continue."
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendRes(res, 401, false, "Invalid credentials.");
    }

    const token = generateSecretToken({ userId: user._id });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return sendRes(res, 200, true, "Login successful.", {
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return sendRes(res, 500, false, "Internal server error");
  }
};

// Forgot Password Controller
module.exports.ForgotPass = async (req, res) => {
  let { email, username } = req.body;
  try {
    if (!email && !username) {
      return sendRes(res, 400, false, "Either email or username is required.");
    }

    if (email) email = String(email).toLowerCase().trim();
    if (username) username = String(username).trim();

    const query = email ? { email } : { username };

    const user = await User.findOne(query);
    if (!user) {
      return sendRes(
        res,
        200,
        true,
        "If an account exists for the provided details, a reset link has been sent to the registered email."
      );
    }

    const recent = await Token.findOne({
      userId: user._id,
      type: "password_reset",
      createdAt: { $gt: new Date(Date.now() - 3 * 60 * 1000) },
    });

    if (recent) {
      return sendRes(
        res,
        429,
        false,
        "A password reset link was sent recently. Please try again after 3 minutes."
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
      type: "password_reset",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      used: false,
    });

    try {
      await forgotPassEmail(user.email, {
        userId: user._id.toString(),
        token: rawToken,
      });
    } catch (emailErr) {
      console.error("Password reset email failed:", emailErr);

      return sendRes(
        res,
        500,
        false,
        "Failed to send reset email. Please contact support."
      );
    }
    return sendRes(
      res,
      200,
      true,
      "If an account exists for the provided details, a reset link has been sent to the registered email."
    );
  } catch (error) {
    console.error("ForgotPass error:", error);
    return sendRes(res, 500, false, "Internal server error");
  }
};

// Reset Password Controller
module.exports.resetPassword = async (req, res) => {
  const { token, id } = req.query;
  const userId = id;
  let { newPassword } = req.body;

  try {
    if (!token || !userId || !newPassword) {
      return sendRes(
        res,
        400,
        false,
        "Invalid request !! Token, user id and new password are required."
      );
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) {
      return sendRes(res, 400, false, pwCheck.reason);
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenDoc = await Token.findOne({
      userId,
      tokenHash,
      type: "password_reset",
    });

    if (!tokenDoc) {
      return sendRes(
        res,
        400,
        false,
        "Invalid or expired Password reset link."
      );
    }

    // already used?
    if (tokenDoc.used) {
      return sendRes(
        res,
        400,
        false,
        "This Password reset link has already been used."
      );
    }

    // expired?
    if (tokenDoc.expiresAt.getTime() < Date.now()) {
      return sendRes(
        res,
        400,
        false,
        "This Password reset link has expired. Please request a new one."
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendRes(res, 404, false, "User not found.");
    }

    user.password = newPassword;
    await user.save();

    // Mark token used and set consumedAt
    tokenDoc.used = true;
    tokenDoc.consumedAt = new Date();
    await tokenDoc.save();

    return sendRes(res, 200, true, "Password reset successfully.");
  } catch (err) {
    console.error("resetPassword error:", err);
    return sendRes(res, 500, false, "Internal server error");
  }
};

// Token-based user get controller
module.exports.getCurrentUser = async (req, res) => {
  try {
    // AuthMiddleware has already verified token and attached req.user
    if (!req.user) {
      return sendRes(res, 401, false, "Not authenticated.");
    }

    return sendRes(res, 200, true, "User authenticated.", {
      user: {
        id: req.user._id,
        username: req.user.username,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        isVerified: req.user.isVerified,
      },
    });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return sendRes(res, 500, false, "Internal server error.");
  }
};

// Logout Controller
module.exports.Logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return sendRes(res, 200, true, "Logged out successfully.");
  } catch (err) {
    console.error("Logout error:", err);
    return sendRes(res, 500, false, "Internal server error.");
  }
};

// Username update controller
module.exports.updateUsername = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return sendRes(res, 401, false, "Not authenticated.");

    const { username } = req.body;
    if (typeof username !== "string" || !username.trim()) {
      return sendRes(res, 400, false, "Username is required.");
    }

    const candidate = username.trim();

    if (candidate === user.username) {
      return sendRes(res, 200, true, "Username unchanged.", {
        user: { id: user._id, username: user.username },
      });
    }

    const exists = await User.findOne({
      username: candidate,
      _id: { $ne: user._id },
    });

    if (exists) return sendRes(res, 409, false, "Username already taken.");

    user.username = candidate;
    await user.save();

    return sendRes(res, 200, true, "Username updated.", {
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    console.error("updateUsername error:", err);
    return sendRes(res, 500, false, "Internal server error.");
  }
};

// Name update Controller
module.exports.updateName = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return sendRes(res, 401, false, "Not authenticated.");

    const { name } = req.body;
    if (typeof name !== "string" || !name.trim()) {
      return sendRes(res, 400, false, "Name is required.");
    }

    const newName = name.trim();

    if (newName === user.name) {
      return sendRes(res, 200, true, "Name unchanged.", {
        name: user.name,
      });
    }

    user.name = newName;
    await user.save();

    return sendRes(res, 200, true, "Name updated successfully.", {
      name: user.name,
    });
  } catch (err) {
    console.error("updateName error:", err);
    return sendRes(res, 500, false, "Internal server error.");
  }
};

// Phone update controller
module.exports.updatePhone = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return sendRes(res, 401, false, "Not authenticated.");

    const { phone } = req.body;

    if (phone === undefined) {
      return sendRes(res, 400, false, "Phone is required.");
    }

    const newPhone = phone === "" ? undefined : String(phone).trim();

    if (newPhone && !/^\+?\d{6,15}$/.test(newPhone)) {
      return sendRes(res, 400, false, "Invalid phone format.");
    }

    if (String(user.phone || "") === String(newPhone || "")) {
      return sendRes(res, 200, true, "Phone unchanged.", {
        user: { id: user._id, phone: user.phone },
      });
    }

    user.phone = newPhone;
    await user.save();

    return sendRes(res, 200, true, "Phone updated.", {
      user: { id: user._id, phone: user.phone },
    });
  } catch (err) {
    console.error("updatePhone error:", err);
    return sendRes(res, 500, false, "Internal server error.");
  }
};

// Change password controller
module.exports.changePassword = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return sendRes(res, 401, false, "Not authenticated.");

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendRes(
        res,
        400,
        false,
        "Current and new passwords are required."
      );
    }

    const userWithPassword = await User.findById(user._id).select("+password");
    const isMatch = await userWithPassword.comparePassword(currentPassword);
    if (!isMatch) {
      return sendRes(res, 401, false, "Current password is incorrect.");
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) {
      return sendRes(res, 400, false, pwCheck.reason);
    }

    const isSamePassword = await userWithPassword.comparePassword(newPassword);
    if (isSamePassword) {
      return sendRes(
        res,
        400,
        false,
        "New password must be different from the current password."
      );
    }

    user.password = newPassword;
    await user.save();

    return sendRes(res, 200, true, "Password changed successfully.");
  } catch (err) {
    console.error("changePassword error:", err);
    return sendRes(res, 500, false, "Internal server error.");
  }
};

// Delete Account Controller
module.exports.deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return sendRes(res, 401, false, "Not authenticated.");

    const { currentPassword } = req.body;
    if (!currentPassword) {
      return sendRes(
        res,
        400,
        false,
        "Current password is required to delete account."
      );
    }

    const userWithPassword = await User.findById(user._id).select("+password");
    const match = await userWithPassword.comparePassword(currentPassword);
    if (!match)
      return sendRes(res, 401, false, "Current password is incorrect.");

    await Token.deleteMany({ userId: user._id });

    await User.findByIdAndDelete(user._id);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return sendRes(res, 200, true, "Account deleted successfully.");
  } catch (err) {
    console.error("deleteAccount error:", err);
    return sendRes(res, 500, false, "Internal server error.");
  }
};

// Google Auth Controller
module.exports.googleAuth = async (req, res) => {
  try {
    const { token: idToken } = req.body;
    if (!idToken) return sendRes(res, 400, false, "ID token is required.");

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return sendRes(res, 400, false, "Invalid ID token.");

    const { sub: googleId, email, name, phone } = payload;

    if (!email) {
      return sendRes(res, 400, false, "Google account has no email.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    // If found by email but googleId missing -> link account
    if (user && !user.googleId) {
      user.googleId = googleId;
      if (!user.isVerified) user.isVerified = true;

      // Save phone only if not already present
      if (!user.phone && phone) user.phone = phone;

      await user.save();
    }

    if (!user) {
      // Generate username from email local part
      const emailLocal = email.split("@")[0];
      const baseUsername =
        emailLocal.replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";

      let username = baseUsername;
      let attempts = 0;

      // Ensure username is unique (max 5 attempts)
      while (attempts < 5) {
        const exists = await User.findOne({ username });
        if (!exists) break;

        attempts++;
        username = `${baseUsername}${Math.floor(Math.random() * 9000) + 1000}`;
      }

      // If STILL not unique -> fallback username
      if (await User.findOne({ username })) {
        username = `${baseUsername}${Date.now().toString().slice(-5)}`;
      }

      user = await User.create({
        username,
        email: normalizedEmail,
        name: name || username,
        googleId,
        ...(phone ? { phone } : {}),
        isVerified: true,
      });
    }

    const token = generateSecretToken({ userId: user._id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return sendRes(res, 200, true, "Login via Google successful.", {
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("googleAuth error:", err);
    return sendRes(res, 500, false, "Internal server error");
  }
};
