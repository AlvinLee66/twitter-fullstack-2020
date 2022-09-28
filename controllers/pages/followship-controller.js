const helpers = require('../../_helpers')

const followshipServices = require('../../services/followship-services')

const followshipController = {
  addFollowing: (req, res, next) => {
    if (Number(helpers.getUser(req).id) === Number(req.body.id)) {
      req.flash('error_messages', '不能追隨自己！')
      return res.redirect(200, 'back')
    }

    followshipServices.addFollowing(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '追隨成功！')
      res.redirect('back')
    })
  },
  removeFollowing: (req, res, next) => {
    followshipServices.removeFollowing(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '取消追隨成功！')
      return res.redirect('back')
    })
  }
}

module.exports = followshipController
