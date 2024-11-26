const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  generateToken: async (userData) => {
    try {
      return jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      });
    } catch (error) {
      throw new Error("Error generating token");
    }
  },

  verifyToken: async (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return false;
    }
  },
};
