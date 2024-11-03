
const response = require("../helpers/response");
const {
    queryGET,
    queryPOST,
    queryPUT,
} = require("../helpers/queryMongo");
// const GridFsStorage = require('multer-gridfs-storage');
const path = require('path');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/uploads'); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "Successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect')
        }
    },

    uploadImage: async (req, res) => {
        res.json(req.file)
    },

    upload,
}