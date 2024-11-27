const response = require("../helpers/response");
const query = require("../helpers/queryMongo");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { database, ObjectId, client } = require("../bin/database");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/" + req.body.source);
  },
  filename: function (req, file, cb) {
    cb(null, req.body.name + "_" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = {
  testConnection: async (req, res) => {
    try {
      response.success(res, "Successfully connected to backend");
    } catch (error) {
      response.failed(res, "Failed to connect", error);
    }
  },

  uploadImage: async (req, res) => {
    try {
      const data = req.body;

      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const file = req.file;

      let results = {};

      let doc;
      if (req.body.itemcheck_id) {
        doc = {
          created_by: data.created_by,
          created_dt: new Date(),
          itemcheck_id: new ObjectId(`${req.body.itemcheck_id}`),
          filename: file.filename,
          contentType: req.file.mimetype,
        };
      }
      if (req.body.source == "opencv") {
        doc = {
          created_by: data.created_by,
          created_dt: new Date(),
          total_face: data.total_face,
          total_body: data.total_body,
          filename: file.filename,
          contentType: req.file.mimetype,
        };

        results = await query.queryPOST("opencv_image", doc);
      }
      if (req.body.source == "profile_pic") {
        doc = {
          created_by: new ObjectId(`${req.body.user_id}`),
          created_dt: new Date(),
          user_id: new ObjectId(`${req.body.user_id}`),
          filename: req.body.name + "_" + file.filename,
          contentType: req.file.mimetype,
        };

        results = await query.queryPOST("profile_pic", doc);
      }

      response.success(res, "Success uploading to backend", results);
    } catch (error) {
      response.failed(res, "Failed uploading to backend", error);
    }
  },

  listImage: async (req, res) => {
    try {
      const results = await query.queryGET("itemcheck_image");

      response.success(res, "Success getting image list", results);
    } catch (error) {
      response.failed(res, "Failed getting image list", error);
    }
  },

  downloadImage: async (req, res) => {
    try {
      const image_id = req.body._id;
      const filter = { _id: new ObjectId(`${image_id}`) };
      const data = await query.queryGET("itemcheck_image", filter);

      const filePath = path.join(__dirname, `../uploads/${data[0].filename}`);

      if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
      }

      res.sendFile(filePath);
    } catch (error) {
      response.failed(res, "Failed downloading image", error);
    }
  },

  upload,
  // upload_opencv,
};
