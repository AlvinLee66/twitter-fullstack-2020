const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const admin = require('./modules/admin')

const tweetController = require('../../controllers/apis/tweet-controller')
const userController = require('../../controllers/apis/user-controller')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', admin)

// user: login, register
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.get('/tweets', tweetController.getTweets)
router.post('/tweets', tweetController.postTweet)
router.get('/tweet', tweetController.postTweet)
router.post('/tweets/:id/replies', tweetController.postReply)
router.post('/tweets/:id/like', tweetController.likePost)
router.post('/tweets/:id/unlike', tweetController.unlikePost)

router.get('/users/:id/tweets', userController.getUserTweets)
router.get('/users/:id/replies', userController.getUserReplies)
router.get('/users/:id/likes', userController.getUserLikes)
router.get('/users/:id/followers', userController.followers)
router.get('/users/:id/followings', userController.followings)

router.use('/', apiErrorHandler)

module.exports = router
