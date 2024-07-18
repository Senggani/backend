var express = require('express');
const { getMachineData, testConnection, getStationData, getLineData, getShopData, addMachine, getPlantData, editMachine } = require('../../controllers/pm_module/masterData.controllers');
var router = express.Router();

router.get('/machine-list', getMachineData)
router.get('/station-list', getStationData)
router.get('/line-list', getLineData)
router.get('/shop-list', getShopData)
router.get('/plant-list', getPlantData)
router.post('/add-machine', addMachine)
router.put('/edit-machine', editMachine)

router.get('/test-connection', testConnection)


module.exports = router