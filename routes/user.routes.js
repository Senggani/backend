var express = require('express');
const {
    testConnection,
    listUsers,
    newUser,
    updateUser,
    deleteUser,
    upload,
    uploadProfilePic,
    testSendMultipleFile,
} = require('../controllers/users.controllers');
var router = express.Router();
var { protect } = require("../middleware/auth.middleware");

router.get('/test-connection', testConnection)
router.get('/list-user', protect, listUsers)
router.post('/new-user', protect, newUser)
router.put('/edit-user', protect, updateUser)
router.put('/delete-user', protect, deleteUser)
router.put('/upload-profile-pic', protect, upload.single('file'), uploadProfilePic)
router.get('/send-multiple', testSendMultipleFile)

module.exports = router