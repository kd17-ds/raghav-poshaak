const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const generateSecretToken = (payload) => {
  return jwt.sign(payload, process.env.TOKEN_KEY, {
    expiresIn: "30d",
  });
};

module.exports = { generateSecretToken };
