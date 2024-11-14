var express = require('express');
const { testConnection,
    listItemcheck,
    listKanban,
    addItemCheck,
} = require('../controllers/kanban.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/itemcheck-list', listItemcheck)
router.get('/kanban-list', listKanban)
router.post('/new-itemcheck', addItemCheck)

module.exports = router