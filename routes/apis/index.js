const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')

const tweetController = require('../../controllers/apis/tweet-controller')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', admin)

router.get('/tweets', tweetController.getTweets)
router.post('/tweets', tweetController.postTweet)

router.use('/', apiErrorHandler)

module.exports = router
