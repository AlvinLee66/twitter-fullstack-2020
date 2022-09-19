const { Tweet, User, Reply, Like } = require('../../models')
const helpers = require('../../_helpers')
const tweetServices = require('../../services/tweet-services')

const tweetController = {
  getTweets: (req, res, next) => {
    tweetServices.getTweets(req, (err, data) => err ? next(err) : res.render('tweets', data))
  },
  postTweet: (req, res, next) => {
    if (!req.body.description) {
      return res.redirect('/')
    }

    if (req.body.description.length > 140) {
      return res.redirect('/')
    }

    tweetServices.postTweet(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功發布推文')
      req.session.createdData = data
      return res.redirect('/tweets')
    })
  },
  getTweet: (req, res, next) => {
    const currentUser = helpers.getUser(req)
    const tweetId = req.params.id
    const userId = helpers.getUser(req).id
    return Promise.all([
      Tweet.findByPk(tweetId, {
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true,
        include: [User, Reply, Like]
      }),
      Reply.findAll({
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true,
        include: User,
        where: { tweet_id: tweetId }
      }),
      Like.findAll({
        raw: true,
        where: { tweet_id: tweetId }
      }),
      User.findAll({
        where: { role: 'user' },
        include: [{ model: User, as: 'Followers' }],
        attributes: ['id', 'name', 'account', 'avatar']
      })
    ])
      .then(([tweet, replies, likes, userData]) => {
        const data = replies.map(r => ({
          ...r,
          author: tweet.User.account
        }))

        const originalDate = tweet.createdAt

        const date = originalDate.getDate()
        const month = originalDate.getMonth()
        const year = originalDate.getFullYear()
        let dayOrNight = '上午'
        let hour = originalDate.getHours()
        if (hour > 12) {
          hour = hour - 12
          dayOrNight = '下午'
        }
        const minutes = originalDate.getMinutes()
        const createdAt = `${dayOrNight} ${hour}:${minutes}．${year}年${month}月${date}日`
        tweet.createdAt = createdAt

        const post = {
          tweet: tweet,
          isLiked: likes?.some(l => l.UserId === userId)
        }

        const recommendFollow = userData.map(user => ({
          ...user.toJSON(),
          followerCount: user.Followers.length,
          isFollowed: currentUser.Followings.some(f => f.id === user.id)
        }))
          .sort((a, b) => b.followerCount - a.followerCount)

        res.render('tweet', { tweet: post, replies: data, likes, recommendFollow, currentUser })
      })
      .catch(err => next(err))
  },
  postReply: (req, res, next) => {
    const userId = helpers.getUser(req).id
    const TweetId = req.params.id
    const comment = req.body.reply

    Reply.create({
      userId,
      TweetId,
      comment
    }).then(reply => {
      res.redirect(`/tweets/${TweetId}/replies`)
    })
      .catch(err => next(err))
  },
  likePost: (req, res, next) => {
    const TweetId = req.params.id
    const UserId = helpers.getUser(req).id
    Like.create({
      UserId,
      TweetId
    }).then(() => {
      res.redirect('back')
    })
      .catch(err => next(err))
  },
  unlikePost: (req, res, next) => {
    const TweetId = req.params.id

    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        TweetId
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
