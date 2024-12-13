// const User = require("../models/Users");
const security = require("../helpers/security");
const auth = require("../helpers/auth");
const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");

const checkAuthorization = (user) => {
  // If user has no assignments yet and isn't admin or team leader
  if (
    !user.assignments.plant &&
    user.role !== "admin" &&
    user.role !== "team_leader"
  ) {
    throw new Error("Account pending assignment. Please contact admin.");
  }
  return true;
};

module.exports = {
  testConnection: async (req, res) => {
    try {
      response.success(res, `Successfully connected to backend`)
    } catch (error) {
      response.failed(res, `Failed to connect`, error.message)
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      let [user, dummyHash] = await Promise.all([
        query.queryGETone('users', { username: username }),
        security.hashPassword("dummy"), // Create dummy hash for timing consistency
      ]);

      // Use constant-time comparison
      const isValidPassword = await security.comparePassword(password, user?.password || dummyHash);

      if (!user || !isValidPassword) {
        return response.notAllowed(res, "Invalid username or password");
      }

      // Check if user is active
      if (!user.is_active) {
        return response.notAllowed(res, "Account is inactive. Please contact admin.");
      }

      // Check authorization
      try {
        checkAuthorization(user);
      } catch (error) {
        return response.notAllowed(res, error.message);
      }

      // Update sessionId
      let sessionId = new Date().getTime().toString();

      await query.queryPUT('users', { username }, { sessionId: sessionId });

      // Generate token that expires in 24 hours
      const token = await auth.generateToken({
        userId: user._id,
        username: user.username,
        role: user.role,
        sessionId: sessionId,
        tokenVersion: user.tokenVersion,
      });

      // Set cookie that also expires in 24 hours
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      };

      res.cookie("auth_token", token, cookieOptions);
      user.sessionId = sessionId;

      response.success(res, "Success to Login", { token, user });
    } catch (error) {
      response.error(res, ("An error occured during login", error.message));
    }
  },

  // Verify token
  verifyToken: async (req, res) => {
    try {
      let user = await query.queryGETone('users', { _id: new ObjectId(req.user._id) })

      if (!user) {
        return response.notAllowed(res, "User not found");
      }

      response.success(res, "Token verified successfully", { user });
    } catch (error) {
      response.error(res, ("Token verification failed ", error.message));
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      // Clear auth cookie if it exists
      if (process.env.NODE_ENV === "production") {
        res.clearCookie("auth_token", {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
      }

      await query.queryPUT('users', { _id: new ObjectId(req.user._id) }, { sessionId: Date.now() })

      response.success(res, "Logged out successfully");
    } catch (error) {
      response.error(res, ("An error occured during logout", error.message));
    }
  },
};
