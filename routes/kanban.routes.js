var express = require('express');
const { testConnection,
    listItemcheck,
    listKanban,
    addItemCheck,
    submitKanban,
    upload,
    // submitItemcheck,
} = require('../controllers/kanban.controllers');
// const { upload } = require ('../controllers/ftp.controllers')
var router = express.Router();


router.get('/test-connection', testConnection)

router.get('/itemcheck-list', listItemcheck)
router.post('/new-itemcheck', addItemCheck)
// router.post('/submit-itemcheck', upload.single('file'), submitItemcheck)

router.get('/kanban-list', listKanban)
router.post('/submit-kanban', upload.array('file', 10), submitKanban)

module.exports = router