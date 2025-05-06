'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("OrderItems", "shippingProductChoice", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("OrderItems", "shippingProductItemChoice", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("OrderItems", "shippingOrderId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("OrderItems", "shippingProductChoice");
    await queryInterface.removeColumn("OrderItems", "shippingProductItemChoice");
    await queryInterface.removeColumn("OrderItems", "shippingOrderId");
  }
};
