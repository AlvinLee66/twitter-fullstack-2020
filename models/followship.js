'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class FollowShip extends Model {
    static associate(models) {
    }
  };
  FollowShip.init(
    {
      followerId: DataTypes.INTEGER,
      followingId: DataTypes.INTEGER,
      isFollowed: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'Followship',
      tableName: 'Followships'
    }
  )
  return FollowShip
}
