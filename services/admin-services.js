const { User, Tweet } = require('../models')
const sequelize = require('sequelize')
const { getOffsetAdminTweets, getPaginationAdminTweets, getOffsetAdminUsers, getPaginationAAdminUsers } = require('../helpers/pagination-helpers')

const adminController = {
  getTweets: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffsetAdminTweets(limit, page)
    return Tweet.findAll({
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'createdAt',
        [sequelize.literal('substring(description,1,50)'), 'description']
      ],
      include: [{
        model: User,
        attributes: ['id', 'name', 'account', 'avatar']
      }],
      limit,
      offset,
      raw: true,
      nest: true
    })
      .then(tweets => {
        return cb(null, {
          tweets,
          pagination: getPaginationAdminTweets(limit, page, tweets.count)
        })
      })
      .catch(err => cb(err))
  },
  deleteTweet: (req, cb) => {
    const { id } = req.params
    return Tweet.findByPk(id)
      .then(tweet => {
        if (!tweet) throw new Error('推文不存在!')
        return tweet.destroy()
      })
      .then(deletedTweet => cb(null, { tweet: deletedTweet }))
      .catch(err => cb(err))
  }
}

module.exports = adminController
