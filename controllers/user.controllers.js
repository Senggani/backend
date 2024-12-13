// const Users = require("../../models/Users");
const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const { database, ObjectId, client } = require("../bin/database");
const { hashPassword } = require("../helpers/security");
const multer = require("multer")
const path = require('path');
const fs = require("fs");
const auth = require("../helpers/auth");

const uploadDir = './uploads/profile_pic/';

const checkAndCreateDir = (req, res, next) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Upload directory created');
  }
  next();
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + '_' + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = {
  testConnection: async (req, res) => {
    try {
      response.success(res, `Successfully connected to backend`, req.body)
    } catch (error) {
      response.failed(res, `Failed to connect`, error.message)
    }
  },

  // testSendMultipleFile: async (req, res) => {
  //   try {
  //     let filePath = [
  //       'uploads/itemcheck/1732709063850_Screenshot 2024-11-19 175616.png',
  //       'uploads/itemcheck/1732709063848_0001.jpg',
  //       'uploads/itemcheck/1732709063847_Screenshot 2024-11-19 175622.png',
  //       './uploads/profile_pic/674c9d3d7ffb8ae2bf944983_0001.jpg',
  //       './uploads/profile_pic/674c9d3d7ffb8ae2bf944983_0001.jpg',
  //       './uploads/profile_pic/674c9d3d7ffb8ae2bf944983_0001.jpg'
  //     ];

  //     response.sendFileAsJSON(res, filePath, 'test send', filePath)
  //   } catch (error) {
  //     console.log(error.message)
  //     response.failed(res, `Failed to connect`, error.message)
  //   }
  // },

  listUsers: async (req, res) => {
    try {
      const data = req.query
      let result;

      if (data.id) {
        result = await query.queryGETone("users", { _id: new ObjectId(data.id) })
      }
      else if (data.station_id) {
        result = await query.queryGET("users", { "assignments.station": new ObjectId(data.station_id) })
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
          created_by: new ObjectId(req.user._id),
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

  updateUser: async (req, res) => {
    try {
      const data = req.body;
      let user = await query.queryGETone("users", { _id: new ObjectId(data.id) })

      let doc = {
        updated_by: new ObjectId(req.user._id),
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
        deleted_by: new ObjectId(req.user._id),
        deleted_dt: new Date(),
        is_active: false
      }

      const result = await query.queryPUT("users", { _id: new ObjectId(data.id) }, doc)

      response.success(res, `Success to delete user`, result)
    } catch (error) {
      response.failed(res, `Failed to delete user`, error.message)
    }
  },

  upload,
  checkAndCreateDir,

  uploadProfilePic: async (req, res) => {
    try {
      const file = req.file
      const authHeader = req.header("Authorization");

      let doc = {
        path: './uploads/profile_pic/' + file.filename,
        filename: file.filename,
        contentType: file.mimetype,
      }

      const token = authHeader.replace("Bearer ", "");
      const user = await auth.verifyToken(token);

      console.log(user)

      const result = await query.queryPUT("users", { _id: new ObjectId(user.userId) }, doc)

      response.success(res, `Success to upload profile pic`, result)
    } catch (error) {
      response.failed(res, `Failed to upload profile pic`, error.message)
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
