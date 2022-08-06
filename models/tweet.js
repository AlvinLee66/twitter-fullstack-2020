'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Tweet extends Model {
    static associate(models) {
      Tweet.belongsTo(models.User)
      Tweet.hasMany(models.Reply)
      Tweet.hasMany(models.Like)
      Tweet.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'tweetId',
        as: 'likedUsers'
      })
    }
  }
  Tweet.init(
    {
      description: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'Tweet',
      tableName: 'Tweets'
    }
  )
  return Tweet
}
