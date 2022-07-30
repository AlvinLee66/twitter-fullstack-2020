'use strict'
const faker = require('faker')
const { User, Tweet } = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const usersIds = await User.findAll({
      attributes: ['id'],
      where: { role: 'user' },
      raw: true
    })
    const tweetsIds = await Tweet.findAll({
      attributes: ['id'],
      raw: true
    })
    await queryInterface.bulkInsert('Replies', Array.from({ length: 300 }).map(() => ({
      comment: faker.lorem.sentence(),
      userId: usersIds[Math.floor(Math.random() * usersIds.length)].id,
      tweetId: tweetsIds[Math.floor(Math.random() * usersIds.length)].id,
      createdAt: new Date(),
      updatedAt: new Date()
    })))
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Replies', null, {})
  }
}
