var express = require('express');
var router = express.Router();
const login = require('../auth/login')
const tpm = require('../tpm/index')
const pmModule = require('../pm_module/index')

router.use('/login', login)
router.use('/tpm', tpm)
router.use('/pm-module', pmModule)

module.exports = router