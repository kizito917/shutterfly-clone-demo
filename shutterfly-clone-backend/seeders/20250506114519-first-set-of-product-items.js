'use strict';

const { productItems } = require('../utils/product');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, we need to get the parent products
    const parentProducts = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Products" WHERE name IN ('Art Prints (Enhanced matte art paper)', 'Wall arts (Framed prints)')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create a mapping of parent names to their IDs
    const parentMap = {};
    parentProducts.forEach(parent => {
      parentMap[parent.name] = parent.id;
    });

    // Map the product items to include the productId from the parent
    const productItemsWithProductId = productItems.map(item => {
      const productId = parentMap[item.parent];
      
      // Create the object to be inserted
      return {
        productId,
        type: item.type,
        sku: item.sku,
        shippingPrice: item.shippingPrice,
        size: item.size,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Bulk insert the product items
    await queryInterface.bulkInsert('ProductItems', productItemsWithProductId, {});
  },

  async down(queryInterface, Sequelize) {
    // Get the parent products
    const parentProducts = await queryInterface.sequelize.query(
      `SELECT id FROM "Products" WHERE name IN ('Art Prints (Enhanced matte art paper)', 'Wall arts (Framed prints)')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Extract the parent IDs
    const parentIds = parentProducts.map(parent => parent.id);
    
    // Delete all product items related to these parents
    await queryInterface.bulkDelete('ProductItems', {
      productId: {
        [Sequelize.Op.in]: parentIds
      }
    }, {});
  }
};