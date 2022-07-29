const { Tweet, User } = require('../models')
const helpers = require('../_helpers')

const tweetController = {
  getTweets: (req, res, next) => {
    return Tweet.findAll({
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true,
      include: User
    })
      .then(tweets => {
        console.log(tweets)
        const data = tweets.map(t => ({
          ...t,
          description: t.description.substring(0, 50)
        }))
        res.render('tweets', { tweets: data })
      })
      .catch(err => next(err))
  },
  postTweet: (req, res, next) => {
    const userId = helpers.getUser(req).id
    const description = req.body.description

    // todo: 錯誤訊息顯示在model上面
    if (!req.body.description) throw new Error('error_messages', '內容不可空白')
    if (req.body.description.trim().length === 0) throw new Error('error_messages', '請輸入推文內容!')
    if (req.body.description.length > 140) throw new Error('error_messages', '推文超過140字數限制')

    User.findByPk(userId, {
      raw: true,
      nest: true
    })
    return Tweet.create({
      userId,
      description
    })
      .then(() => {
        req.flash('success_messages', '成功發布推文')
        res.redirect('/tweets')
      })
      .catch(err => next(err))
  }

}

module.exports = tweetController
