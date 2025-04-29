'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserImage.belongsTo(models.User, {foreignKey: 'user', as: 'user_details'});
    }
  }
  UserImage.init({
    user: DataTypes.INTEGER,
    imagePath: DataTypes.STRING,
    canvaDesignId: DataTypes.STRING,
    canvaDesignUrl: DataTypes.TEXT,
    canvaDesignViewUrl: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'UserImage',
  });
  return UserImage;
};