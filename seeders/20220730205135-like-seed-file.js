'use strict'

const { User, Tweet } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: ['id'],
      raw: true
    })

    const tweets = await Tweet.findAndCountAll()

    const likeList = []

    users.forEach(user => {
      likeList.push({
        userId: user.id,
        tweetId: tweets.rows[Math.floor(Math.random() * tweets.count)].id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })

    await queryInterface.bulkInsert('Likes', likeList, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Likes', null, {})
  }
}
