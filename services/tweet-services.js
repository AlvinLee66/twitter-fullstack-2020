const { Tweet, User, Reply, Like } = require('../models')
const helpers = require('../_helpers')

const tweetController = {
  getTweets: (req, cb) => {
    const currentUser = helpers.getUser(req)
    return Promise.all([
      Tweet.findAll({
        order: [['createdAt', 'DESC']],
        nest: true,
        include: [User, Reply, Like]
      }),
      User.findAll({
        where: { role: 'user' },
        include: [{ model: User, as: 'Followers' }],
        attributes: ['id', 'name', 'account', 'avatar']
      })
    ])
      .then(([tweets, userData]) => {
        const user = helpers.getUser(req)
        const data = tweets.map(t => ({
          ...t.dataValues,
          description: t.description.substring(0, 50),
          User: t.User.dataValues,
          user,
          isLiked: t.Likes.some(f => f.userId === user.id)
        }))

        const recommendFollow = userData.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: currentUser.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)

        return cb(null, { tweets: data, user, recommendFollow, currentUser })
      })
      .catch(err => cb(err))
  },
  postTweet: (req, cb) => {
    const userId = helpers.getUser(req).id
    const description = req.body.description

    return Tweet.create({
      userId,
      description
    })
      .then(newTweet => cb(null, { tweet: newTweet }))
      // .catch(err => cb(err))
  }
}
module.exports = tweetController
