const jwt = require("jsonwebtoken");

module.exports = {
  generateToken: async (userData) => {
    try {
      return jwt.sign(userData, "my_secret_key", {
        expiresIn: "24h",
      });
    } catch (error) {
      throw new Error("Error generating token");
    }
  },

  verifyToken: async (token) => {
    try {
      return jwt.verify(token, "my_secret_key");
    } catch (error) {
      return false;
    }
  },
};
