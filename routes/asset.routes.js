var express = require('express');
const { testConnection,
    getMachineList,
    newMachine

} = require('../controllers/asset.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)
router.get('/machine-list', getMachineList)
router.post('/new-machine', newMachine)


module.exports = router