var express = require('express');
const { testConnection,
    listItemcheck,
    listKanban,
} = require('../controllers/kanban.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/itemcheck-list', listItemcheck)
router.get('/kanban-list', listKanban)

module.exports = router