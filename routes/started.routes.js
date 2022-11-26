const express = require('express')
const router = express.Router()
const verifyAPI = require('../middleware/verifyKey.middleware')
const startBot = require('../api').startBot

router.post('/', verifyAPI, startBot.main)

module.exports = router
