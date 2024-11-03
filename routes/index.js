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

router.use('/asset', asset)
router.use('/ftp', ftp)

module.exports = router