const express = require('express')
const router = express.Router()
const verifyAPI = require('../middleware/verifyKey.middleware')
const sample = require('../api').sampleMessage

router.post('/', verifyAPI, sample.main)

module.exports = router
