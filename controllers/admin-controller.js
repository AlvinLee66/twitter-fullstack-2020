const { User, Tweet } = require('../models')
const sequelize = require('sequelize')
const { getOffsetAdminTweets, getPaginationAdminTweets, getOffsetAdminUsers, getPaginationAAdminUsers } = require('../helpers/pagination-helpers')

const adminController = {
  signInPage: (req, res) => {
    res.render('admin/signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', 'login successfully!')
    res.redirect('/admin/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', 'logout successfully!')
    req.logout()
    res.redirect('/admin/signin')
  },
  getTweets: (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffsetAdminTweets(limit, page)
    Tweet.findAll({
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'createdAt',
        [sequelize.literal('substring(description,1,200)'), 'description']
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
        return res.render('admin/tweets', {
          tweets,
          pagination: getPaginationAdminTweets(limit, page, tweets.count)
        })
      })
      .catch(next)
  },
  deleteTweet: (req, res, next) => {
    const { id } = req.params
    return Tweet.findByPk(id)
      .then(tweet => {
        if (!tweet) throw new Error("Restaurant didn't exist!")
        return tweet.destroy()
      })
      .then(deletedTweet => res.redirect('/admin/tweets'))
      .catch(next)
  },
  getUsers: (req, res, next) => {
    const DEFAULT_LIMIT = 10
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffsetAdminUsers(limit, page)
    User.findAll({
      where: { role: 'user' },
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) from tweets AS tweet WHERE tweet.userId = user.id)'), 'tweetsCount'],
          [sequelize.literal('(SELECT COUNT(*) from likes WHERE likes.userId = user.id)'), 'likesCount'],
          [sequelize.literal('(SELECT COUNT(*) from followships AS followship WHERE followship.followingId = user.id)'), 'followingsCount'],
          [sequelize.literal('(SELECT COUNT(*) from followships AS followship WHERE followship.followerId = user.id)'), 'followersCount']
        ]
      },
      order: [
        [sequelize.literal('tweetsCount'), 'DESC']
      ],
      limit,
      offset,
      raw: true,
      nest: true
    })
      .then(users => {
        console.log(users)
        return res.render('admin/users', {
          users,
          pagination: getPaginationAAdminUsers(limit, page, users.count)
        })
      })
      .catch(next)
  }
}

module.exports = adminController
