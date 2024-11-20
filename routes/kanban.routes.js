var express = require('express');
const { testConnection,
    listItemcheck,
    listKanban,
    addItemcheck,
    submitKanban,
    historyKanban,
    upload,
    historyItemcheck,
    // submitItemcheck,
} = require('../controllers/kanban.controllers');
// const { upload } = require ('../controllers/ftp.controllers')
var router = express.Router();


router.get('/test-connection', testConnection)

router.get('/list-itemcheck', listItemcheck)
router.post('/new-itemcheck', addItemcheck)
router.get('/history-itemcheck', historyItemcheck)
// router.post('/submit-itemcheck', upload.single('file'), submitItemcheck)

router.get('/kanban-list', listKanban)
router.get('/history-kanban', historyKanban)
router.post('/submit-kanban', upload.array('file', 10), submitKanban)

module.exports = router