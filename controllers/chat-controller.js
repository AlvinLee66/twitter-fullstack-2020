const helpers = require('../_helpers')
const { User } = require('../models')

const chatController = {
  getPublicChatroom: (req, res, next) => {
    const currentUserId = helpers.getUser(req).id

    // const users = 取得所有其它線上User
    // 資料庫裡面抓user資料
    User.findByPk(currentUserId, { raw: true })
      .then(currentUser => {
        res.render('chatroom-public', { currentUser })
      })
  },
  getPrivateChatroom: (req, res, next) => {
    res.render('chatroom-private')
  }

}
module.exports = chatController
