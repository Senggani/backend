var express = require('express');
const testingControllers = require('../../controllers/tpm/test.controllers');
var router = express.Router();


router.post('/connection', testingControllers.testConnection)
router.post('/get-completeness', testingControllers.getCompleteness)
router.post('/table-activities', testingControllers.tableActivities)

module.exports = router