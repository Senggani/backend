var express = require('express');
const { testConnection,
    listItemcheck,
    listKanban,
    // listItemcheckMachine,
} = require('../controllers/kanban.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/itemcheck-list', listItemcheck)
router.get('/kanban-list', listKanban)
// router.get('/itemcheck-list-machine', listItemcheckMachine)

module.exports = router