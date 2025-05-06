'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProductItem.belongsTo(models.Product, {foreignKey: 'productId', as: 'product'});
    }
  }
  ProductItem.init({
    productId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    sku: DataTypes.STRING,
    shippingPrice: DataTypes.DECIMAL(10, 2),
    size: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProductItem',
  });
  return ProductItem;
};