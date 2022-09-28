const bcrypt = require('bcryptjs')
const helpers = require('../_helpers')
const { User, Tweet, Reply, Like } = require('../models')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientId(IMGUR_CLIENT_ID)

const userController = {
  signUp: (req, cb) => {
    const { account, name, email, password, checkPassword } = req.body
    const errors = []

    function validateEmail (email) {
      const re = /\S+@\S+\.\S+/
      return re.test(email)
    }

    if (!validateEmail(email)) {
      errors.push({ message: 'email非有效格式！' })
    }

    if (!name || !email || !password || !checkPassword || !account) {
      errors.push({ message: '所有欄位都是必填。' })
    }

    if (password !== checkPassword) {
      errors.push({ message: '密碼與確認密碼不相符！' })
    }

    if (name.length > 50) {
      errors.push({ message: '名稱上限為50字！' })
    }

    return Promise.all([
      User.findOne({ where: { account }, raw: true }),
      User.findOne({ where: { email }, raw: true })
    ])
      .then(([findAccount, findEmail]) => {
        if (findEmail) {
          errors.push({ message: 'email 已重複註冊！' })
        }

        if (findAccount) {
          errors.push({ message: 'account 已重複註冊！' })
        }

        if (errors.length) {
          return cb(null, {
            errors,
            account,
            name,
            email
          })
        }

        bcrypt.hash(password, 10)
          .then(hash => User.create({
            account,
            name,
            email,
            password: hash,
            role: 'user',
            avatar: '/images/blackACLogo.png',
            banner: '/images/defaultBanner.png'
          }))

        return cb(null, { account, name, email, role: 'user', password, checkPassword })
      })
      .catch(err => cb(err))
  },
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
  },
  getSetting: (req, cb) => {
    const currentUser = helpers.getUser(req)

    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        cb(null, { user, currentUser })
      })
      .catch(err => cb(err))
  },
  putSetting: (req, cb) => {
    const currentUser = helpers.getUser(req)
    const { account, name, email, password, checkPassword } = req.body

    if (!account || !name || !email || !password || !checkPassword) throw new Error('所有欄位都是必填！')
    if (password !== checkPassword) throw new Error('密碼與確認密碼不相符！')
    if (name.length > 50) throw new Error('字數超出上限！')

    return Promise.all([
      User.findByPk(currentUser.id),
      User.findOne({ where: { email }, raw: true }),
      User.findOne({ where: { account }, raw: true })
    ])
      .then(([user, findEmail, findAccount]) => {
        if (findAccount) {
          if (findAccount.id !== user.id) throw new Error('account 已重複註冊！')
        }

        if (findEmail) {
          if (findEmail.id !== user.id) throw new Error('email 已重複註冊！')
        }

        bcrypt.hash(password, 10)
          .then(hash => {
            return user.update({
              account,
              name,
              email,
              password: hash
            })
          })
        return cb(null, { account, name, email, password, checkPassword })
      })
  },
  editUser: async (req, cb) => {
    try {
      const currentUserId = helpers.getUser(req) && helpers.getUser(req).id

      // 修改名稱 和 自我介紹
      const { name, introduction } = req.body

      // 修改背景圖
      const rawFiles = JSON.stringify(req.files)
      const files = JSON.parse(rawFiles)
      let imgurBanner
      let imgurAvatar

      if (Object.keys(files).length === 0) {
        imgurBanner = 0
        imgurAvatar = 0
      } else if (
        typeof files.banner === 'undefined' &&
        typeof files.avatar !== 'undefined'
      ) {
        imgurBanner = 0
        imgurAvatar = await imgur.uploadFile(files.avatar[0].path)
      } else if (
        typeof files.banner !== 'undefined' &&
        typeof files.avatar === 'undefined'
      ) {
        imgurAvatar = 0
        imgurBanner = await imgur.uploadFile(files.banner[0].path)
      } else {
        imgurBanner = await imgur.uploadFile(files.banner[0].path)
        imgurAvatar = await imgur.uploadFile(files.avatar[0].path)
      }

      await User.update(
        {
          name,
          introduction,
          banner: imgurBanner?.link || User.banner,
          avatar: imgurAvatar?.link || User.avatar
        },
        {
          where: {
            id: currentUserId
          }
        }
      )
      // todo: cb function
    } catch (err) {
      cb(err)
    }
  }
}
module.exports = userController
