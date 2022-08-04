const { Tweet, User, Reply, Like, sequelize } = require('../models')
const helpers = require('../_helpers')

const tweetController = {
  getTweets: (req, res, next) => {
    const userId = (helpers.getUser(req) && helpers.getUser(req).id) || []
    return Tweet.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'createdAt',
        [sequelize.literal('substring(description,1,200)'), 'description'],
        [sequelize.literal('(SELECT COUNT(*) from likes WHERE likes.userId = userId)'), 'likesCount'],
        [sequelize.literal('(SELECT COUNT(*) from replies WHERE replies.userId = userId)'), 'RepliesCount']
      ]
    },
      raw: true,
      nest: true
    })
      .then(tweets => {
        return res.render('users/tweets', {
          tweets
        })
      })
    .catch(err => next(err))
},
  postTweet: (req, res, next) => {
    const userId = (helpers.getUser(req) && helpers.getUser(req).id) || []
const { description } = req.body
if (!description) return res.redirect('back')
if (description.length > 140) return res.redirect('back')
return Tweet.create({
  userId,
  description
})
  .then(tweet => {
    req.flash('success_messages', '成功發布推文')
    res.redirect('back')
  })
  .catch(err => next(err))
  },
getTweet: (req, res, next) => {
  const tweetId = req.params.id
  const userId = (helpers.getUser(req) && helpers.getUser(req).id) || []
  Tweet.findByPk(tweetId, {
    include: [
      User,
      { model: User, as: 'LikedUsers' },
      { model: Reply, include: User }
    ],
    order: [['Replies', 'createdAt', 'DESC']],
    raw: true,
    nest: true
  })
    .then(tweet => {
      if (!tweet) throw new Error('No such tweet exist!')
      res.render('tweet', {
        tweet,
        isLiked: tweet.LikedUsers.map(tl => tl.id).includes(userId)
      })
    })
},
  postReply: (req, res, next) => {
    const userId = (helpers.getUser(req) && helpers.getUser(req).id) || []
    const TweetId = req.params.id
    const comment = req.body.reply
    if (comment.length > 140) return res.redirect('back')
    return Reply.create({
      userId,
      TweetId,
      comment
    }).then(reply => {
      res.redirect(`/tweets/${TweetId}/replies`)
    })
      .catch(err => next(err))
  },
    likePost: (req, res, next) => {
      const tweetId = req.params.id
      const userId = (helpers.getUser(req) && helpers.getUser(req).id) || []
      Like.create({
        userId,
        tweetId
      }).then(like => {
        res.redirect('back')
      })
        .catch(err => next(err))
    },
      unlikePost: (req, res, next) => {
        const tweetId = req.params.id
        const userId = (helpers.getUser(req) && helpers.getUser(req).id) || []
        return Like.findOne({
          where: {
            userId,
            tweetId
          }
        }).then(like => {
          return like.destroy()
            .then(() => {
              res.redirect('back')
            })
        })
          .catch(err => next(err))
      }
}

module.exports = tweetController
