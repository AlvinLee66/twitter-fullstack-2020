const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const { authenticated } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')
const followshipController = require('../controllers/followship-controller')

router.use('/admin', admin)

router.post('/followships/:userId', authenticated, followshipController.addFollowing)
router.delete('/followships/:userId', authenticated, followshipController.removeFollowing)

router.use('/', generalErrorHandler)

module.exports = router
