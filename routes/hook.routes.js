const express = require('express')
const router = express.Router()
const verifyAPI = require('../middleware/verifyKey.middleware')
const webHook = require('../api').WebHook

router.post('/', verifyAPI, webHook.started)

module.exports = router
