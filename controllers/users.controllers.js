// const Users = require("../../models/Users");
const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");
const { Result } = require("express-validator");
const { hashPassword } = require("../helpers/security");

module.exports = {
  testConnection: async (req, res) => {
    try {
      response.success(res, `Successfully connected to backend`, req.body)
    } catch (error) {
      response.failed(res, `Failed to connect`, error)
    }
  },
  // Get all users (for admin)
  listUsers: async (req, res) => {
    try {
      const data = req.query
      let result;

      if (data.id) {
        result = await query.queryGETone("users", { _id: new ObjectId(data.id) })
      }
      else if (data.station_id) {
        result = await query.queryGETone("users", { "assignments.station": new ObjectId(data.station_id) })
      }
      else {
        result = await query.queryGET("users", { deleted_by: null });
      }

      response.success(res, "Users retrieved successfully", result);
    } catch (error) {
      response.failed(res, "Failed to get user", error.message);
    }
  },

  newUser: async (req, res) => {
    try {
      const data = req.body;
      console.log(await hashPassword(data.password))

      let duplicate = query.queryGETone("users", { username: data.username })
      if (duplicate.username == data.username) {
        response.failed(res, `Failed to add user: Username is already exist`)
      } else {
        let doc = {
          created_by: new ObjectId(req.user.user_id),
          created_dt: new Date(),
          username: data.username,
          password: await hashPassword(data.password),
          role: data.role,
          assignments: {},
          is_active: true,
        }
        if (data.assignments.plant) {
          doc.assignments.plant = new ObjectId(data.assignments.plant)
        }
        if (data.assignments.shop) {
          doc.assignments.shop = new ObjectId(data.assignments.shop)
        }
        if (data.assignments.line) {
          doc.assignments.line = new ObjectId(data.assignments.line)
        }
        if (data.assignments.station) {
          doc.assignments.station = new ObjectId(data.assignments.station)
        }

        const result = await query.queryPOST("users", doc)

        response.success(res, `Success to add user`, { doc, result })
      }
    } catch (error) {
      response.failed(res, `Failed to add user`, error.message)
    }
  },

  // Update user role and assignments
  updateUser: async (req, res) => {
    try {
      const data = req.body;
      let user = await query.queryGETone("users", { _id: new ObjectId(data.id) })

      let doc = {
        updated_by: new ObjectId(req.user.user_id),
        updated_dt: new Date(),
        assignments: user.assignments
      }

      if (data.username) {
        doc.username = data.username
      }
      if (data.role) {
        doc.role = data.role
      }
      if (data.is_active) {
        doc.is_active = data.is_active
      }
      if (data.assignments.plant) {
        doc.assignments.plant = new ObjectId(data.assignments.plant)
      }
      if (data.assignments.shop) {
        doc.assignments.shop = new ObjectId(data.assignments.shop)
      }
      if (data.assignments.line) {
        doc.assignments.line = new ObjectId(data.assignments.line)
      }
      if (data.assignments.station) {
        doc.assignments.station = new ObjectId(data.assignments.station)
      }

      const result = await query.queryPUT("users", { _id: new ObjectId(data.id) }, doc)

      response.success(res, "User updated successfully", result);
    } catch (error) {
      response.failed(res, "Error to update user", error.message);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const data = req.body;

      let doc = {
        deleted_by: new ObjectId(req.user.user_id),
        deleted_dt: new Date(),
        is_active: false
      }

      const result = await query.queryPUT("users", { _id: new ObjectId(data.id) }, doc)

      response.success(res, `Success to delete user`, result)
    } catch (error) {
      response.failed(res, `Failed to delete user`, error)
    }
  },

  // Get user profile
  // getUserProfile: async (req, res) => {
  //   try {
  //     const user = await query.queryGETone("users", { _id: req.query.id })

  //     response.success(res, "Profile retrieved successfully", user);
  //   } catch (error) {
  //     response.error(res, "Error to get user", error.message);
  //   }
  // },

  // Activate/Deactivate user
  // toggleUserStatus: async (req, res) => {
  //   try {
  //     const data = req.body;

  //     let doc = {
  //       updated_by: new ObjectId(req.body.user_id),
  //       updated_dt: new Date(),
  //       isAc
  //     }

  //     const { userId } = req.params;

  //     if (req.user.role !== "admin") {
  //       return response.notAllowed(res, "Only admin can update user status");
  //     }

  //     const user = await User.findById(userId);

  //     if (!user) {
  //       return response.notAllowed(res, "User not found");
  //     }

  //     user.isActive = !user.isActive;
  //     await user.save();

  //     response.success(res, "User status updated successfully", user);
  //   } catch (error) {
  //     console.error("Toggle user status error:", error);
  //     response.error(res, error.message);
  //   }
  // },
};
