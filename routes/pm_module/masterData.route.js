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
        addItemCheck,
        addPart,
        editStation,
        editLine,
        editShop,
        deleteStation,
        deleteLine,
        deleteShop
        
    } = require('../../controllers/pm_module/masterData.controllers');
var router = express.Router();

// GET
router.get('/machine-list', getMachineData)
router.get('/station-list', getStationData)
router.get('/line-list', getLineData)
router.get('/shop-list', getShopData)
router.get('/plant-list', getPlantData)
router.get('/item-check-table', itemCheckTable)
router.get('/part-table', getPartTable)

// POST
router.post('/add-machine', addMachine)
router.post('/add-station', addStation)
router.post('/add-line', addLine)
router.post('/add-shop', addShop)
router.post('/add-item-check', addItemCheck)
router.post('/add-part', addPart)

// PUT
router.put('/edit-machine', editMachine)
router.put('/edit-station', editStation)
router.put('/edit-line', editLine)
router.put('/edit-shop', editShop)
router.put('/delete-machine', deleteMachine)
router.put('/delete-station', deleteStation)
router.put('/delete-line', deleteLine)
router.put('/delete-shop', deleteShop)

router.get('/test-connection', testConnection)


module.exports = router