var express = require('express');

const { testConnection,
        insertData,
} = require('../controllers/timeseries.controllers');
const { readData } = require('../controllers/timeseries.controllers');
var router = express.Router();

router.get('/test-connection', testConnection)
router.post(`/new-data`, insertData)
router.get(`/read-data`, readData)

module.exports = router