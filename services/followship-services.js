const { Followship } = require('../models')
const helpers = require('../_helpers')

const followshipController = {
  addFollowing: (req, cb) => {
    Followship.create({
      followerId: helpers.getUser(req).id,
      followingId: req.body.id
    })
      .then(following => {
        return cb(null, { following })
      })
      .catch(err => cb(err))
  },
  removeFollowing: (req, cb) => {
    Followship.findOne({
      where: {
        followerId: Number(helpers.getUser(req).id),
        followingId: Number(req.params.id)
      }
    })
      .then(followship => {
        followship.destroy()
        return cb(null, { followship })
      })
      .catch(err => cb(err))
  }
}
module.exports = followshipController
