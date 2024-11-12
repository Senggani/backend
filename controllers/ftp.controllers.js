
const response = require("../helpers/response");
const {
    queryGET,
    queryPOST,
    queryPUT,
} = require("../helpers/queryMongo");
const { GridFsStorage } = require('multer-gridfs-storage');
const uri = "mongodb://localhost:27017/";
const multer = require("multer")
const MongoClient = require("mongodb").MongoClient
const GridFSBucket = require("mongodb").GridFSBucket
const mongoClient = new MongoClient(uri)

const url = "mongodb://localhost:27017/images"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
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
            response.failed(res, 'Failed to connect', error)
        }
    },

    uploadImage: async (req, res) => {
        try {
            const file = req.file
            
            response.success(res, "Success uploading to backend", file)
        } catch (error) {
            response.failed(res, 'Failed uploading to backend', error)
        }
    },

    retireveImage: async (req, res) => {
        try {
            await mongoClient.connect()

            const database = mongoClient.db("images")
            const images = database.collection("photos.files")
            const cursor = images.find({})
            const count = await cursor.count()
            if (count === 0) {
                return res.status(404).send({
                    message: "Error: No Images found",
                })
            }

            // console.log(mongoClient.db().collection())

            const allImages = []

            await cursor.forEach(item => {
                allImages.push(item)
            })

            res.send({ files: allImages })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                message: "Error Something went wrong",
                error,
            })
        }
    },

    downloadImage: async (req, res) => {
        try {
            await mongoClient.connect()

            const database = mongoClient.db("images")

            const imageBucket = new GridFSBucket(database, {
                bucketName: "photos",
            })

            let downloadStream = imageBucket.openDownloadStreamByName(
                req.body.filename
            )

            downloadStream.on("data", function (data) {
                return res.status(200).write(data)
            })

            downloadStream.on("error", function (data) {
                return res.status(404).send({ error: "Image not found" })
            })

            downloadStream.on("end", () => {
                return res.end()
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                message: "Error Something went wrong",
                error,
            })
        }
    },

    upload,
}