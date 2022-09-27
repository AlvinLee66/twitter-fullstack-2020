const userServices = require('../../services/user-services')

const userController = {
  getUserTweets: (req, res, next) => {
    userServices.getUserTweets(req, (err, data) => err ? next(err) : res.json(data))
  },
  getUserReplies: (req, res, next) => {
    userServices.getUserReplies(req, (err, data) => err ? next(err) : res.json(data))
  },
  getUserLikes: (req, res, next) => {
    userServices.getUserLikes(req, (err, data) => err ? next(err) : res.json(data))
  },
  followers: (req, res, next) => {
    userServices.followers(req, (err, data) => err ? next(err) : res.json(data))
  },
  followings: (req, res, next) => {
    userServices.followings(req, (err, data) => err ? next(err) : res.json(data))
  }
}

module.exports = userController
