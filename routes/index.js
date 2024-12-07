var express = require('express');
var router = express.Router();

const asset = require('./asset.routes.js')
const ts = require('./timeseries.routes.js')
const python = require('./pythonHandler.routes.js')
const kanban = require('./kanban.routes.js')
const rmq = require('./rmq.routes.js')
const user = require('./user.routes.js')
const login = require('./login.routes.js')
const itemcheck = require('./itemcheck.routes.js')

router.use('/asset', asset)
router.use('/ts', ts)
router.use('/py', python)
router.use('/kanban', kanban)
router.use('/rmq', rmq)
router.use('/user', user)
router.use('/login', login);
router.use('/itemcheck', itemcheck);

module.exports = router