var express = require('express');
const { testConnection,
    sendMessage,
    consumeMessage
} = require('../controllers/rmq.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/send-msg', sendMessage)
router.get('/cons-msg', consumeMessage)

module.exports = router