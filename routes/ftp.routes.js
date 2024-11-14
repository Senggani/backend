var express = require('express');

const { testConnection,
        uploadImage,
        upload,
        listImage,
        downloadImage,
        // upload_opencv,
        // uploadOpencv
} = require('../controllers/ftp.controllers');
var router = express.Router();

router.get('/test-connection', testConnection)
router.post('/upload-image', upload.single('file'), uploadImage)
// router.post('/upload-opencv', upload_opencv.single('file'), uploadOpencv)
router.get('/list-image', listImage)
router.get('/download-image', downloadImage)

module.exports = router
