var express = require('express');

const { testConnection,
        uploadImage,
        upload,
        retireveImage,
        downloadImage
} = require('../controllers/ftp.controllers');
var router = express.Router();

router.get('/test-connection', testConnection)
router.post('/upload-image', upload.single('file'), uploadImage)
router.get('/retrieve-image', retireveImage)
router.get('/download-image', downloadImage)

module.exports = router
