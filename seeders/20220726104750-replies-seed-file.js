'use strict'
const faker = require('faker')
const { User, Tweet } = require('../models')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const usersIds = await User.findAll({
      where: { role: 'user' },
      attributes: ['id'],
      raw: true
    })
    const tweetsIds = await Tweet.findAll({
      attributes: ['id'],
      raw: true
    })
    await queryInterface.bulkInsert('Replies', Array.from({ length: 300 }).map((_, i) => ({
      comment: faker.lorem.sentence(),
      userId: usersIds[~~(Math.random() * usersIds.length)].id,
      tweetId: tweetsIds[~~(i / 3)].id,
      createdAt: new Date(),
      updatedAt: new Date()
    })))
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Replies', null, {})
  }
}
