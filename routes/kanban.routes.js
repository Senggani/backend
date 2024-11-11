var express = require('express');
const { testConnection,
    listItemcheck,
    // listItemcheckMachine,
} = require('../controllers/kanban.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/itemcheck-list', listItemcheck)
// router.get('/itemcheck-list-machine', listItemcheckMachine)

module.exports = router