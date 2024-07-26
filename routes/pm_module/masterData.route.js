var express = require('express');
const { getMachineData, 
        testConnection, 
        getStationData, 
        getLineData, 
        getShopData, 
        addMachine, 
        getPlantData, 
        editMachine, 
        deleteMachine,
        addStation,
        addLine,
        addShop,
        itemCheckTable,
        getPartTable,
        addItemCheck
        
    } = require('../../controllers/pm_module/masterData.controllers');
var router = express.Router();

router.get('/machine-list', getMachineData)
router.get('/station-list', getStationData)
router.get('/line-list', getLineData)
router.get('/shop-list', getShopData)
router.get('/plant-list', getPlantData)
router.post('/add-machine', addMachine)
router.post('/add-station', addStation)
router.post('/add-line', addLine)
router.post('/add-shop', addShop)
router.put('/edit-machine', editMachine)
router.put('/delete-machine', deleteMachine)
router.get('/item-check-table', itemCheckTable)
router.get('/part-table', getPartTable)
router.post('/add-item-check', addItemCheck)

router.get('/test-connection', testConnection)


module.exports = router