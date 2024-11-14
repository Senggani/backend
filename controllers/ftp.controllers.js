
const response = require("../helpers/response");
const {
    queryGET,
    queryPOST,
    queryPUT,
    ObjectId,
} = require("../helpers/queryMongo");
const multer = require("multer")
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, req.body.rmq + '_' + file.originalname);
    }
});

const upload = multer({ storage });

module.exports = {
    testConnection: async (req, res) => {
        try {
            response.success(res, "Successfully connected to backend")
        } catch (error) {
            response.failed(res, 'Failed to connect', error)
        }
    },

    uploadImage: async (req, res) => {
        try {
            console.log(req.body)

            if (!req.file) {
                return res.status(400).send('No file uploaded.');

            }

            let results = {}

            if (req.body.itemcheck_id) {

                const file = req.file

                const doc = {
                    created_by: data.created_by,
                    created_dt: new Date(),
                    itemcheck_id: new ObjectId(`${req.body.itemcheck_id}`),
                    filename: file.filename,
                    contentType: req.file.mimetype,
                }

                results = await queryPOST("itemcheck_image", doc)
            } else if (req.body.rmq) {

                const file = req.file

                const doc = {
                    created_by: "RabbitMQ",
                    created_dt: new Date(),
                    filename: `${Date()}_${file.filename})`,
                    contentType: req.file.mimetype,
                }
                console.log(doc.filename)

                results = await queryPOST("opencv_image", doc)

            }

            response.success(res, "Success uploading to backend", results)
        } catch (error) {
            response.failed(res, 'Failed uploading to backend', error)
        }
    },

    listImage: async (req, res) => {
        try {

            const results = await queryGET("itemcheck_image")

            response.success(res, "Success getting image list", results)
        } catch (error) {
            response.failed(res, 'Failed getting image list', error)
        }
    },

    downloadImage: async (req, res) => {
        try {
            const image_id = req.body._id;
            const filter = { _id: new ObjectId(`${image_id}`) }
            const data = await queryGET("itemcheck_image", filter)

            const filePath = path.join(__dirname, `../uploads/${data[0].filename}`);

            if (!fs.existsSync(filePath)) {
                return res.status(404).send('File not found');
            }

            res.sendFile(filePath);
        } catch (error) {
            response.failed(res, 'Failed downloading image', error)
        }
    },

    upload,
}