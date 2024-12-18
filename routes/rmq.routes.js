var express = require('express');
const { testConnection,
    sendMessage,
    consumeMessage,
    uploadOpencvImage,
    checkAndCreateDir,
    upload,
    downloadOpencvImage,
    uploadESP32Image,
    uploadESP32ImageYolo,
    clearESPimg,
} = require('../controllers/rmq.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/send-msg', sendMessage)
router.get('/cons-msg', consumeMessage)
router.post('/opencv', checkAndCreateDir, upload.single('file'), uploadOpencvImage)
router.post('/esp32', uploadESP32ImageYolo)
router.get('/get-image', downloadOpencvImage)
router.get('/delete-all-images', clearESPimg)

module.exports = router