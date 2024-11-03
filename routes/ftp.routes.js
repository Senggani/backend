var express = require('express');

const { testConnection,
        uploadImage,
        upload
} = require('../controllers/ftp.controllers');
var router = express.Router();

router.get('/test-connection', testConnection)
router.post('/upload-image', upload.single('file'), uploadImage)

module.exports = router
