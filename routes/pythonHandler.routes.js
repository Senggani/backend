var express = require('express');

const { 
    testConnection,
    detectFace,
    //     uploadImage,
    //     upload,
    //     retireveImage,
    //     downloadImage
} = require('../controllers/pythonHandler.controllers');
var router = express.Router();

router.get('/test-connection', testConnection)
router.post('/detect-face', detectFace)
// router.post('/upload-image', upload.single('file'), uploadImage)
// router.get('/retrieve-image', retireveImage)
// router.get('/download-image', downloadImage)

module.exports = router
