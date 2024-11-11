var express = require('express');
const { testConnection,
    listItemcheck,
} = require('../controllers/kanban.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/itemcheck-list', listItemcheck)

module.exports = router