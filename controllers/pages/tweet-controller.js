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
    tweetServices.getTweet(req, (err, data) => err ? next(err) : res.render('tweet', data))
  },
  postReply: (req, res, next) => {
    const TweetId = req.params.id

    tweetServices.postReply(req, (err, data) => {
      if (err) return next(err)
      return res.redirect(`/tweets/${TweetId}/replies`)
    })
  },
  likePost: (req, res, next) => {
    tweetServices.likePost(req, (err, data) => {
      if (err) return next(err)
      return res.redirect('back')
    })
  },
  unlikePost: (req, res, next) => {
    tweetServices.unlikePost(req, (err, data) => {
      if (err) return next(err)
      return res.redirect('back')
    })
  }
}

module.exports = tweetController
