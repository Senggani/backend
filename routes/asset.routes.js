var express = require('express');
const { testConnection,
        // listMachine,
        // newMachine,
        // editMachine,
        // deleteMachine,
        // listStation,
        // newStation,
        // editStation,
        // deleteStation,
        listAsset,
        newAsset,
        editAsset,
        deleteAsset,
} = require('../controllers/asset.controllers');
var router = express.Router();


router.get('/test-connection', testConnection)

router.get('/list-asset', listAsset)
router.post('/new-asset', newAsset)
router.put('/edit-asset', editAsset)
router.put('/delete-asset', deleteAsset)

// router.get('/list-machine', listMachine)
// router.post('/new-machine', newMachine)
// router.put('/edit-machine', editMachine)
// router.put('/delete-machine', deleteMachine)

// router.get('/list-station', listStation)
// router.post('/new-station', newStation)
// router.put('/edit-station', editStation)
// router.put('/delete-station', deleteStation)

module.exports = router