var express = require('express');
const {
    testConnection,
    listItemcheck,
    addItemcheck,
    historyItemcheck,
    deleteItemcheck,
    editItemcheck,
    listTools,
    addTools,
    editTools,
    deleteTools,
    listSparePart,
    addSparePart,
    editSparePart,
    deleteSparePart,

} = require('../controllers/itemcheck.controllers');
var router = express.Router();
var { protect } = require("../middleware/auth.middleware");


router.get('/test-connection', testConnection)

router.get('/list-itemcheck', listItemcheck)
router.post('/add-itemcheck', protect, addItemcheck)
router.put('/edit-itemcheck', protect, editItemcheck)
router.put('/delete-itemcheck', protect, deleteItemcheck)
router.get('/history-itemcheck', historyItemcheck)

router.get('/list-tool', listTools)
router.post('/add-tool', protect, addTools)
router.put('/edit-tool', protect, editTools)
router.put('/delete-tool', protect, deleteTools)

router.get('/list-sparepart', listSparePart)
router.post('/add-sparepart', protect, addSparePart)
router.put('/edit-sparepart', protect, editSparePart)
router.put('/delete-sparepart', protect, deleteSparePart)

module.exports = router