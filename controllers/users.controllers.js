// const Users = require("../../models/Users");
const response = require("../helpers/response");
const {
  queryGET,
  queryPOST,
  queryPUT,
  queryJOIN,
  queryJOIN2,
} = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");

module.exports = {
  // Get all users (for admin)
  getAllUsers: async (req, res) => {
    try {
      // const users = await Users.find()
      //   .select("-password")
      //   .populate("assignments.plant")
      //   .populate("assignments.shop")
      //   .populate("assignments.line")
      //   .populate("assignments.station");

      const users = await client.collection('users').find()
      console.log(users)

      response.success(res, "Users retrieved successfully", users);
    } catch (error) {
      console.error("Get all users error:", error);
      response.error(res, error.message);
    }
  },

  // Update user role and assignments
  updateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { role, assignments } = req.body;

      // Check if requester is admin
      if (req.user.role !== "admin") {
        return response.notAllowed(
          res,
          "Only admin can update user roles and assignments"
        );
      }

      const updateUser = await User.findByIdAndUpdate(
        userId,
        { role, assignments },
        { new: true }
      ).select("-password");

      if (!updateUser) {
        return response.notAllowed(res, "User not found");
      }

      response.success(res, "User updated successfully", updateUser);
    } catch (error) {
      console.error("Update user error:", error);
      response.error(res, error.message);
    }
  },

  // Get user profile
  getUserProfile: async (req, res) => {
    try {
      const user = await Users.findById(req.user._id)
        .select("-password")
        .populate("assignments.plant")
        .populate("assignments.shop")
        .populate("assignments.line")
        .populate("assignments.station");

      if (!user) {
        return response.notAllowed(res, "User not found");
      }

      response.success(res, "Profile retrieved successfully", user);
    } catch (error) {
      console.error("Get user profile error:", error);
      response.error(res, error.message);
    }
  },

  // Activate/Deactivate user
  toggleUserStatus: async (req, res) => {
    try {
      const { userId } = req.params;

      if (req.user.role !== "admin") {
        return response.notAllowed(res, "Only admin can update user status");
      }

      const user = await User.findById(userId);

      if (!user) {
        return response.notAllowed(res, "User not found");
      }

      user.isActive = !user.isActive;
      await user.save();

      response.success(res, "User status updated successfully", user);
    } catch (error) {
      console.error("Toggle user status error:", error);
      response.error(res, error.message);
    }
  },
};
