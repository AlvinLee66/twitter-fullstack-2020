'use strict'
const { User } = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: ['id'],
      raw: true
    })

    const userIdList = users.map(user => user.id)

    const followships = []

    userIdList.forEach(userId => {
      const newList = userIdList.filter(id => id !== userId)
      const data = {}
      data.followerId = userId
      data.followingId = newList[~~(Math.random() * newList.length)]
      data.createdAt = new Date()
      data.updatedAt = new Date()
      followships.push(data)
    })

    await queryInterface.bulkInsert('Followships', followships)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Followships', null, {})
  }
}
