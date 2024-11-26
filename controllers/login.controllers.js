// const User = require("../models/Users");
const security = require("../helpers/security");
const auth = require("../helpers/auth");
const response = require("../helpers/response");
const {
  queryGET,
  queryPOST,
  queryPUT,
  queryJOIN,
  queryJOIN2,
} = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");

// Sanitize user object
const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  role: user.role,
  assignments: user.assignments,
});

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
  // register: async (req, res) => {
  //   try {
  //     const { username, email, password, confirmPassword } = req.body;

  //     // Check if passwords match
  //     if (password !== confirmPassword) {
  //       return response.notAllowed(res, "Passwords do not match");
  //     }

  //     // Check if user already exists
  //     const existingUser = await User.findOne({
  //       $or: [{ email }, { username }],
  //     });

  //     if (existingUser) {
  //       return response.notAllowed(res, "Username or email already exists");
  //     }

  //     // Create new user (default role is team_member)
  //     const user = new User({
  //       username,
  //       email,
  //       password,
  //       role: "team_member",
  //       assignments: {
  //         plant: null,
  //         shop: null,
  //         line: null,
  //         station: null,
  //       },
  //       isActive: true,
  //     });

  //     await user.save();

  //     // Generate token
  //     const token = await auth.generateToken({
  //       userId: user._id,
  //       username: user.username,
  //       role: user.role,
  //     });

  //     response.success(res, "Account created successfully", {
  //       token,
  //       user: {
  //         username: user.username,
  //         email: user.email,
  //         role: user.role,
  //         assignments: user.assignments,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Registration error:", error);
  //     response.error(res, error.message);
  //   }
  // },

  login: async (req, res) => {
    try {
      console.log(req.body)
      const { username, password } = req.body;
      console.log(req.body)
      console.log(
        `[${new Date().toISOString()}] Login attempt for username: ${username}`
      );

      // const projection = {password: 1, _id: 0}

      let user = await client.collection('users').findOne({ username })

      // Find user and handle timing attacks
      const [dummyHash] = await Promise.all([

        security.hashPassword("dummy"), // Create dummy hash for timing consistency
      ]);

      // Use constant-time comparison
      const isValidPassword = await security.comparePassword(
        password,
        user?.password || dummyHash
      );
      console.log("Password valid:", isValidPassword);

      if (!user || !isValidPassword) {
        console.log(
          `[${new Date().toISOString()}] Failed login attempt for username: ${username}`
        );
        return response.notAllowed(res, "Invalid username or password");
      }

      // Check if user is active
      if (!user.isActive) {
        console.log(
          `[${new Date().toISOString()}] Inactive user attempted login: ${username}`
        );
        return response.notAllowed(
          res,
          "Account is inactive. Please contact admin."
        );
      }

      // Check authorization
      try {
        checkAuthorization(user);
      } catch (error) {
        console.log(
          `[${new Date().toISOString()}] Authorization check failed for user ${username}: ${error.message
          }`
        );
        return response.notAllowed(res, error.message);
      }

      // Update sessionId
      let sessionId = new Date().getTime().toString();

      const updateDoc = {
        $set: { sessionId: sessionId } // Specify the fields you want to update
      };

      let ressss = await client.collection('users').updateOne({ username }, updateDoc)
      console.log(ressss)

      // await user.save();

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
        // secure: process.env.NODE_ENV === "production",
        secure: "development",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      };

      res.cookie("auth_token", token, cookieOptions);

      console.log("Sending response:", {
        success: true,
        message: "Success to Login",
        data: {
          token,
          user: sanitizeUser(user),
        },
      });

      console.log(
        `[${new Date().toISOString()}] Successful login for user: ${username}`
      );
      response.success(res, "Success to Login", {
        token,
        user: sanitizeUser(user),
      });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Login error:`,
        error.message
      );
      response.error(res, "An error occured during login");
    }
  },

  // Change password
  // changePassword: async (req, res) => {
  //   try {
  //     const { currentPassword, newPassword, confirmPassword } = req.body;
  //     const userId = req.user.userId; // Get user ID from token

  //     // Check if new password match
  //     if (newPassword !== confirmPassword) {
  //       return response.notAllowed(
  //         res,
  //         "New password and confirm password do not match"
  //       );
  //     }

  //     // Find user
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       return response.notAllowed(res, "User not found");
  //     }

  //     // Verify current password
  //     const isValidPassword = await security.comparePassword(currentPassword);
  //     if (!isValidPassword) {
  //       return response.notAllowed(res, "Current password is incorrect");
  //     }

  //     // Update password
  //     user.password = newPassword;
  //     await user.save();

  //     response.success(res, "Password changed successfully");
  //   } catch (error) {
  //     console.error("Change password error:", error);
  //     response.error(res, error.message);
  //   }
  // },

  // Verify token
  verifyToken: async (req, res) => {
    try {
      // const user = await User.findById(req.user.userId)
      //   .select("-password")
      //   .populate("assignments.plant")
      //   .populate("assignments.shop")
      //   .populate("assignments.line")
      //   .populate("assignments.station");

      let user = await client.collection('users').findOne({ _id: new ObjectId(req.user.userId) })

      if (!user) {
        console.log(
          `[${new Date().toISOString()}] Token verification failed: User not found - ${req.user.userId
          }`
        );
        return response.notAllowed(res, "User not found");
      }

      console.log(
        `[${new Date().toISOString()}] Token verified for user: ${user.username
        }`
      );
      response.success(res, "Token verified successfully", {
        user: sanitizeUser(user),
      });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Token verification error:`,
        error.message
      );
      response.error(res, "Token verification failed");
    }
  },

  testConnection: async (req, res) => {
    try {
      response.success(res, "Successfully connected to backend")
    } catch (error) {
      response.failed(res, 'Failed to connect', error)
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

      let user = await client.collection('users').findOne({ username: new ObjectId(req.user.userId) })
      let sessionId = Date.now()
      const updateDoc = {
        $set: { sessionId: sessionId } // Specify the fields you want to update
      };

      let ressss = await client.collection('users').updateOne({ username: new ObjectId(req.user.userId) }, updateDoc)
      console.log(ressss)

      // Update user's sessionId to invalidate existing tokens
      // await User.findByIdAndUpdate(req.user.userId, {
      //   sessionId: Date.now(),
      // });

      console.log(
        `[${new Date().toISOString()}] User logged out successfully: ${req.user.username}`
      );
      response.success(res, "Logged out successfully");
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Logout error:`,
        error.message
      );
      response.error(res, "An error occured during logout");
    }
  },
};
