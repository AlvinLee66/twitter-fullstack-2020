// const bcrypt = require('bcryptjs')
const helpers = require('../_helpers')
const { User, Tweet, Reply, Like } = require('../models')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientId(IMGUR_CLIENT_ID)

const userController = {
  getUserTweets: (req, cb) => {
    const currentUser = helpers.getUser(req)
    const id = req.params.id
    return Promise.all([
      User.findByPk(id, {
        include: [{ model: User, as: 'Followings' }, { model: User, as: 'Followers' }]
      }),
      Tweet.findAll({
        where: { userId: id },
        include: [Like, Reply],
        order: [['createdAt', 'desc']],
        nest: true
      }),
      User.findAll({
        where: { role: 'user' },
        include: [{ model: User, as: 'Followers' }],
        attributes: ['id', 'name', 'account', 'avatar']
      })
    ])
      .then(([targetUser, tweets, userData]) => {
        if (!targetUser) throw new Error('使用者不存在！')

        if (currentUser) {
          currentUser.isFollowed = currentUser.Followings.some(u => u.id === targetUser.id)
        }

        const tweetsData = tweets
          .map(t => ({
            ...t.toJSON(),
            likedCount: t.Likes.length,
            repliedCount: t.Replies.length,
            isLiked: t.Likes.some(like => like.userId === currentUser.id)
          }))

        const recommendFollow = userData.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: currentUser.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)

        const tweetsLength = tweetsData.length

        return cb(null, { targetUser: targetUser.toJSON(), tweets: tweetsData, currentUser, tweetsLength, recommendFollow })
      })
      .catch(err => cb(err))
  },
  getUserReplies: (req, cb) => {
    const currentUser = helpers.getUser(req)
    const id = req.params.id
    return Promise.all([
      User.findByPk(id, {
        include: [{ model: User, as: 'Followings' }, { model: User, as: 'Followers' }, Tweet]
      }),
      Reply.findAll({
        where: { userId: id },
        include: [{ model: Tweet, include: User }],
        order: [['createdAt', 'desc']],
        raw: true,
        nest: true
      }),
      User.findAll({
        where: { role: 'user' },
        include: [{ model: User, as: 'Followers' }],
        attributes: ['id', 'name', 'account', 'avatar']
      })
    ])
      .then(([targetUser, replies, userData]) => {
        if (!targetUser) throw new Error('使用者不存在！')

        if (currentUser) {
          currentUser.isFollowed = currentUser.Followings.some(u => u.id === targetUser.id)
        }

        const recommendFollow = userData.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: currentUser.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)

        const tweetsLength = targetUser.Tweets.length
        return cb(null, { targetUser: targetUser.toJSON(), replies, currentUser, tweetsLength, recommendFollow })
      })
      .catch(err => cb(err))
  },
  getUserLikes: (req, cb) => {
    const currentUser = helpers.getUser(req)
    const id = req.params.id
    return Promise.all([
      User.findByPk(id, {
        include: [{ model: User, as: 'Followings' }, { model: User, as: 'Followers' }, Tweet]
      }),
      Like.findAll({
        where: { userId: id },
        include: [
          { model: Tweet, include: User },
          { model: Tweet, include: Like },
          { model: Tweet, include: Reply }
        ],
        order: [['createdAt', 'desc']],
        nest: true
      }),
      User.findAll({
        where: { role: 'user' },
        include: [{ model: User, as: 'Followers' }],
        attributes: ['id', 'name', 'account', 'avatar']
      })
    ])
      .then(([targetUser, likes, userData]) => {
        if (!targetUser) throw new Error('使用者不存在！')

        if (currentUser) {
          currentUser.isFollowed = currentUser.Followings.some(u => u.id === targetUser.id)
        }

        const likesData = likes
          .map(l => ({
            ...l.toJSON(),
            likedCount: l.Tweet.Likes.length,
            repliedCount: l.Tweet.Replies.length,
            isLiked: currentUser ? l.Tweet.Likes.some(like => like.UserId === currentUser.id) : false
          }))

        const recommendFollow = userData.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: currentUser.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)

        const tweetsLength = targetUser.Tweets.length
        return cb(null, { targetUser: targetUser.toJSON(), likes: likesData, currentUser, tweetsLength, recommendFollow })
      })
      .catch(err => cb(err))
  },
  followers: (req, cb) => {
    const userId = req.params.id
    const currentUser = helpers.getUser(req)

    return Promise.all([
      User.findByPk(userId, {
        nest: true,
        include: [Tweet, { model: User, as: 'Followers' }]
      }),
      User.findAll({
        where: { role: 'user' },
        include: [{ model: User, as: 'Followers' }],
        attributes: ['id', 'name', 'account', 'avatar']
      })
    ])
      .then(([user, userData]) => {
        const result = user.Followers.map(user => {
          return {
            ...user.toJSON(),
            isFollowed: currentUser?.Followings.some(f => f.id === user.id)
          }
        })
          .sort((a, b) => b.Followship.createdAt - a.Followship.createdAt)

        const recommendFollow = userData.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: currentUser.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)

        const tweetsLength = user.Tweets.length
        return cb(null, { user: user.toJSON(), followers: result, tweetsLength, recommendFollow, currentUser })
      })
      .catch(err => cb(err))
  },
  followings: (req, cb) => {
    const userId = req.params.id
    const currentUser = helpers.getUser(req)

    return Promise.all([
      User.findByPk(userId, {
        nest: true,
        include: [Tweet, { model: User, as: 'Followings' }]
      }),
      User.findAll({
        where: { role: 'user' },
        include: [{ model: User, as: 'Followers' }],
        attributes: ['id', 'name', 'account', 'avatar']
      })
    ])
      .then(([user, userData]) => {
        const result = user.Followings.map(user => {
          return {
            ...user.toJSON(),
            isFollowed: currentUser?.Followings.some(f => f.id === user.id)
          }
        })
          .sort((a, b) => b.Followship.createdAt - a.Followship.createdAt)

        const recommendFollow = userData.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: currentUser.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)

        const tweetsLength = user.Tweets.length
        return cb(null, { user: user.toJSON(), followings: result, tweetsLength, recommendFollow, currentUser })
      })
      .catch(err => cb(err))
  }
}
module.exports = userController
