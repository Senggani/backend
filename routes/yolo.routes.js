var express = require('express');
const {
    testConnection,
    checkAndCreateDir,
    upload,
    detectObject,

} = require('../controllers/yolo.controllers');
var router = express.Router();
var { protect } = require("../middleware/auth.middleware");

router.get('/test-connection', testConnection)
router.post('/detect-object', checkAndCreateDir, upload.single('file'), detectObject)

module.exports = router