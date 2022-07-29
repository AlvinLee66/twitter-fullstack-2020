'use strict'
const faker = require('faker')
const { User, Tweet } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await User.findAll({
      raw: true,
      nest: true,
      where: { role: 'user' },
      attributes: ['id']
    })
    const tweets = await Tweet.findAll({
      raw: true,
      nest: true,
      attributes: ['id']
    })

    const userRandomIndex = Math.floor(Math.random() * users.length)
    const tweetRandomIndex = Math.floor(Math.random() * tweets.length)
    const userId = users[userRandomIndex].id
    const tweetId = tweets[tweetRandomIndex].id

    await queryInterface.bulkInsert(
      'Replies',
      Array.from({ length: 300 }, () => ({
        comment: faker.lorem.sentence(),
        user_id: userId,
        tweet_id: tweetId,
        created_at: new Date(),
        updated_at: new Date()
      }))
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Replies', null, {})
  }
}
