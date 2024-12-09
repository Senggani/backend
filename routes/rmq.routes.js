var express = require('express');
const { testConnection,
    sendMessage,
    consumeMessage,
    uploadOpencvImage,
    checkAndCreateDir,
    upload,
    downloadOpencvImage,
    uploadESP32Image
} = require('../controllers/rmq.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/send-msg', sendMessage)
router.get('/cons-msg', consumeMessage)
router.post('/opencv', checkAndCreateDir, upload.single('file'), uploadOpencvImage)
router.post('/esp32', uploadESP32Image)
router.get('/get-image', downloadOpencvImage)

module.exports = router