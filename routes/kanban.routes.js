var express = require('express');
const { 
    testConnection,
    upload,
    listItemcheck,
    listKanban,
    addItemcheck,
    submitKanban,
    historyKanban,
    historyItemcheck,
    addWorkOrder,
    listWorkOrder,
    editWorkOrder,
    deleteWorkOrder,
    deleteItemcheck,
    editItemcheck,
    editKanban,
    deleteKanban,
    // submitItemcheck,
} = require('../controllers/kanban.controllers');
// const { upload } = require ('../controllers/ftp.controllers')
var router = express.Router();


router.get('/test-connection', testConnection)

router.get('/list-itemcheck', listItemcheck)
router.post('/add-itemcheck', addItemcheck)
router.put('/edit-itemcheck', editItemcheck)
router.put('/delete-itemcheck', deleteItemcheck)
router.get('/history-itemcheck', historyItemcheck)
// router.post('/submit-itemcheck', upload.single('file'), submitItemcheck)

router.get('/list-kanban', listKanban)
router.get('/history-kanban', historyKanban)
router.put('/edit-kanban', editKanban)
router.put('/delete-kanban', deleteKanban)
router.post('/submit-kanban', upload.array('file', 30), submitKanban)

router.get('/list-work-order', listWorkOrder)
router.post('/add-work-order', addWorkOrder)
router.put('/edit-work-order', editWorkOrder)
router.put('/delete-work-order', deleteWorkOrder)
// router.post('/submit-kanban', upload.array('file', 10), submitKanban)

module.exports = router