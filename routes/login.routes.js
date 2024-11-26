const router = require("express").Router();
const {
  login,
  verifyToken,
  logout,
} = require("../controllers/login.controllers");
const { protect } = require("../middleware/auth.middleware");
const loginLimiter = require("../middleware/rateLimit.middleware");

// Public routes (no authentication needed)
router.post("/login", loginLimiter, login);
// router.post("/register", register);

// Protected routes (require authentication)
// router.post("/change-password", protect, changePassword);
router.post("/verify", protect, verifyToken);
router.post("/logout", protect, logout);

module.exports = router;
