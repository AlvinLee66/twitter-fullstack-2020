const bcrypt = require('bcryptjs')
const helpers = require('../../_helpers')
const { User } = require('../../models')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientId(IMGUR_CLIENT_ID)

const userServices = require('../../services/user-services')

const userController = {
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    const { account, name, email, password, checkPassword } = req.body
    const errors = []

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
          return res.render('signup', {
            errors,
            account,
            name,
            email
          })
        }

        return bcrypt.hash(password, 10)
          .then(hash => User.create({
            account,
            name,
            email,
            password: hash,
            role: 'user',
            avatar: '/images/blackACLogo.png',
            banner: '/images/defaultBanner.png'
          }))
          .then(() => {
            req.flash('success_messages', '帳號註冊成功！')
            res.redirect('/signin')
          })
          .catch(err => next(err))
      })
  },
  getUserTweets: (req, res, next) => {
    userServices.getUserTweets(req, (err, data) => err ? next(err) : res.render('user-tweets', data))
  },
  getUserReplies: (req, res, next) => {
    userServices.getUserReplies(req, (err, data) => err ? next(err) : res.render('user-replies', data))
  },
  getUserLikes: (req, res, next) => {
    userServices.getUserLikes(req, (err, data) => err ? next(err) : res.render('user-likes', data))
  },
  getSetting: (req, res, next) => {
    const currentUser = helpers.getUser(req)
    const currentUserId = helpers.getUser(req) && helpers.getUser(req).id

    if (currentUserId !== Number(req.params.id)) {
      req.flash('error_messages', '無法修改他人資料！')
      return res.redirect(`/users/${currentUserId}/setting`)
    }

    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        res.render('setting', { user, currentUser })
      })
      .catch(err => next(err))
  },
  putSetting: (req, res, next) => {
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

        return bcrypt.hash(password, 10)
          .then(hash => {
            return user.update({
              account,
              name,
              email,
              password: hash
            })
          })
      })
      .then(() => {
        req.flash('success_messages', '個人資料修改成功！')
        return res.redirect(`/users/${currentUser.id}/tweets`)
      })
      .catch(err => next(err))
  },
  editUser: async (req, res, next) => {
    try {
      const currentUserId = helpers.getUser(req) && helpers.getUser(req).id

      // 修改名稱 和 自我介紹
      const { name, introduction } = req.body

      if (!name) {
        req.flash('error_messages', '名稱是必填！')
        return res.redirect(`/users/${currentUserId}/tweets`)
      }

      if (introduction.length > 165 || name.length > 50) {
        req.flash('error_messages', '字數超出上限！')
        return res.redirect(`/users/${currentUserId}/tweets`)
      }

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
      req.flash('success_messages', '個人資料修改成功！')
      return res.redirect(`/users/${currentUserId}/tweets`)
    } catch (err) {
      next(err)
    }
  },
  followers: (req, res, next) => {
    userServices.followers(req, (err, data) => err ? next(err) : res.render('user-followers', data))
  },
  followings: (req, res, next) => {
    userServices.followings(req, (err, data) => err ? next(err) : res.render('user-followings', data))
  }

}
module.exports = userController
