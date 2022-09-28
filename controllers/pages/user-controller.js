const helpers = require('../../_helpers')
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
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '帳號註冊成功！')
      return res.redirect('/signin')
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
    const currentUserId = helpers.getUser(req) && helpers.getUser(req).id

    if (currentUserId !== Number(req.params.id)) {
      req.flash('error_messages', '無法修改他人資料！')
      return res.redirect(`/users/${currentUserId}/setting`)
    }

    userServices.getSetting(req, (err, data) => err ? next(err) : res.render('setting', data))
  },
  putSetting: (req, res, next) => {
    const currentUser = helpers.getUser(req) && helpers.getUser(req)
    userServices.putSetting(req, (err, data) => err ? next(err) : res.redirect(`/users/${currentUser.id}/tweets`))
    req.flash('success_messages', '個人資料修改成功！')
  },
  editUser: (req, res, next) => {
    const currentUser = helpers.getUser(req) && helpers.getUser(req)

    // 修改名稱 和 自我介紹
    const { name, introduction } = req.body

    if (!name) {
      req.flash('error_messages', '名稱是必填！')
      return res.redirect(`/users/${currentUser.id}/tweets`)
    }

    if (introduction.length > 165 || name.length > 50) {
      req.flash('error_messages', '字數超出上限！')
      return res.redirect(`/users/${currentUser.id}/tweets`)
    }

    userServices.editUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '個人資料修改成功！')
      // todo: cannot redirect
      return res.redirect(`/users/${currentUser.id}/tweets`)
    })
  },
  followers: (req, res, next) => {
    userServices.followers(req, (err, data) => err ? next(err) : res.render('user-followers', data))
  },
  followings: (req, res, next) => {
    userServices.followings(req, (err, data) => err ? next(err) : res.render('user-followings', data))
  }

}
module.exports = userController
