'use strict';

const { productItems } = require('../utils/product');
const models = require('../models/index');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all the unique parent product names from the productItems array
    const parentProductNames = [...new Set(productItems.map(item => item.parent))];
    
    // Get all relevant parent products in one query
    const parentProducts = await models.Product.findAll({
      where: {
        name: {
          [Sequelize.Op.in]: parentProductNames
        }
      },
      attributes: ['id', 'name']
    });

    // Create a mapping of parent names to their IDs
    const parentMap = {};
    parentProducts.forEach(parent => {
      parentMap[parent.name] = parent.id;
    });

    // Get existing product items to avoid duplicates
    const existingProductItems = await models.ProductItem.findAll({
      attributes: ['sku'] // We'll use SKU as the unique identifier
    });
    
    // Create a Set of existing SKUs for faster lookup
    const existingSkus = new Set(existingProductItems.map(item => item.sku));

    // Map the product items to include the productId from the parent
    // and filter out any that already exist
    const newProductItems = productItems
      .filter(item => !existingSkus.has(item.sku)) // Filter out existing items
      .map(item => {
        const productId = parentMap[item.parent];
        
        // Skip items if we don't have a matching parent
        if (!productId) {
          console.log(`Warning: Parent product "${item.parent}" not found for SKU: ${item.sku}`);
          return null;
        }
        
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
      })
      .filter(item => item !== null); // Remove any null items (those without matching parents)

    // Only insert if we have new items
    if (newProductItems.length > 0) {
      // Bulk insert the product items
      await queryInterface.bulkInsert('ProductItems', newProductItems, {});
      console.log(`Inserted ${newProductItems.length} new product items`);
    } else {
      console.log('No new product items to insert');
    }
  },

  async down(queryInterface, Sequelize) {
    // Get all the unique parent product names from the productItems array
    const parentProductNames = [...new Set(productItems.map(item => item.parent))];
    
    // Get the parent products
    const parentProducts = await models.Product.findAll({
      where: {
        name: {
          [Sequelize.Op.in]: parentProductNames
        }
      },
      attributes: ['id']
    });

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