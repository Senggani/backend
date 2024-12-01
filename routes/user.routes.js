var express = require('express');
const {
    testConnection,
    listUsers,
    newUser,
    updateUser,
    deleteUser,
} = require('../controllers/users.controllers');
var router = express.Router();
var { protect } = require("../middleware/auth.middleware");

router.get('/test-connection', testConnection)
router.get('/list-user', listUsers)
router.post('/new-user', protect, newUser)
router.put('/edit-user', protect, updateUser)
router.put('/delete-user', protect, deleteUser)

module.exports = router