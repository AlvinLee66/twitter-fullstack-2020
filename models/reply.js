'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Reply extends Model {
    static associate(models) {
      Reply.belongsTo(models.User, { foreignKey: 'UserId' })
      Reply.belongsTo(models.Tweet, { foreignKey: 'TweetId' })
    }
  }
  Reply.init(
    {
      comment: DataTypes.TEXT,
      userId: DataTypes.INTEGER,
      tweetId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Reply',
      tableName: 'Replies'
    }
  )
  return Reply
}
