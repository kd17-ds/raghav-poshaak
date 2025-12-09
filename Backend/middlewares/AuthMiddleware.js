const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const sendRes = require("../utils/sendRes");

module.exports.AuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendRes(res, 401, false, "Access denied. No token provided.");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_KEY);
    } catch (err) {
      return sendRes(res, 401, false, "Invalid or expired token.");
    }

    // Your token payload contains userId, not id
    const userId = decoded.userId;
    if (!userId) {
      return sendRes(res, 401, false, "Invalid token payload.");
    }

    // Find user and attach to req
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return sendRes(res, 401, false, "User not found.");
    }

    req.userId = user._id;
    req.user = user;

    next();
  } catch (error) {
    console.error("AuthMiddleware Error:", error);
    return sendRes(res, 500, false, "Internal server error.");
  }
};
