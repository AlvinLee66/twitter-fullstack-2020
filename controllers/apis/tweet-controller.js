const tweetServices = require('../../services/tweet-services')

const tweetController = {
  getTweets: (req, res, next) => {
    tweetServices.getTweets(req, (err, data) => err ? next(err) : res.json(data))
  },
  postTweet: (req, res, next) => {
    tweetServices.postTweet(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getTweet: (req, res, next) => {
    tweetServices.getTweet(req, (err, data) => err ? next(err) : res.json(data))
  },
  postReply: (req, res, next) => {
    tweetServices.postReply(req, (err, data) => err ? next(err) : res.json(data))
  },
  likePost: (req, res, next) => {
    tweetServices.likePost(req, (err, data) => err ? next(err) : res.json(data))
  },
  unlikePost: (req, res, next) => {
    tweetServices.unlikePost(req, (err, data) => err ? next(err) : res.json(data))
  }
}
module.exports = tweetController
