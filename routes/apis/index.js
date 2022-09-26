const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')

const tweetController = require('../../controllers/apis/tweet-controller')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', admin)

router.get('/tweets', tweetController.getTweets)
router.post('/tweets', tweetController.postTweet)
router.get('/tweet', tweetController.postTweet)
router.post('/tweets/:id/replies', tweetController.postReply)
router.post('/tweets/:id/like', tweetController.likePost)
router.post('/tweets/:id/unlike', tweetController.unlikePost)

router.use('/', apiErrorHandler)

module.exports = router
