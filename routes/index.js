var express = require('express');
var router = express.Router();
// const login = require('../auth/login')
// const tpm = require('../tpm/index')
// const pmModule = require('../pm_module/index')

// router.use('/login', login)
// router.use('/tpm', tpm)
// router.use('/pm-module', pmModule)

const asset = require('./asset.routes.js')
const ftp = require('./ftp.routes.js')
const ts = require('./timeseries.routes.js')
const upload_Image = require('./upload.routes.js')

router.use('/asset', asset)
router.use('/ftp', ftp)
router.use('/ts', ts)
router.use('/upload', upload_Image)

module.exports = router