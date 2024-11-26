const rateLimit = require("express-rate-limit");

var loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 1000, // 5 attempts per window
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {loginLimiter};
