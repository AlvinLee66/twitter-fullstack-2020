const express = require('express')
const router = express.Router()
const { authenticated } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

const tweetController = require('../controllers/tweet-controller')
const userController = require('../controllers/user-controller')
const followshipController = require('../controllers/followship-controller')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', userController.signIn)
router.get('/logout', userController.logout)

// todo: 驗證
router.get('/tweets', tweetController.getTweets)
router.post('/tweets', tweetController.postTweet)

router.get('/users/:id/setting', userController.getSetting)
router.get('/users', userController.getUsers)

router.post('/followships/:userId', authenticated, followshipController.addFollowing)
router.delete('/followships/:userId', authenticated, followshipController.removeFollowing)

router.use('/', generalErrorHandler)

module.exports = router
