const express = require('express')
const router = express.Router()
const tweetController = require('../../controllers/apis/tweet-controller')
const adminController = require('../../controllers/apis/admin-controller')

router.get('/tweets', tweetController.getTweets)
router.get('/admin/tweets', adminController.getTweets)

module.exports = router
