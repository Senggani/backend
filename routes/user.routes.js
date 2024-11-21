var express = require('express');
const {
    testConnection,
    addUser,
} = require('../controllers/user.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.post('/add-user', addUser)

module.exports = router