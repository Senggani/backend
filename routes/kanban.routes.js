var express = require('express');
const {
    testConnection,
    upload,
    listKanban,
    submitKanban,
    historyKanban,
    addWorkOrder,
    listWorkOrder,
    editWorkOrder,
    deleteWorkOrder,
    editKanban,
    deleteKanban,
    // submitItemcheck,
} = require('../controllers/kanban.controllers');
var { protect } = require("../middleware/auth.middleware");

var router = express.Router();

router.get('/test-connection', testConnection)

router.get('/list-kanban', listKanban)
router.get('/history-kanban', historyKanban)
router.put('/edit-kanban', protect, editKanban)
router.put('/delete-kanban', protect, deleteKanban)
router.post('/submit-kanban', upload.array('file', 30), submitKanban)

router.get('/list-work-order', listWorkOrder)
router.post('/add-work-order', protect, addWorkOrder)
router.put('/edit-work-order', protect, editWorkOrder)
router.put('/delete-work-order', protect, deleteWorkOrder)

module.exports = router