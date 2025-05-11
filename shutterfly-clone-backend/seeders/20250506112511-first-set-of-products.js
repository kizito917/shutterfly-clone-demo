'use strict';

const { products } = require('../utils/product');
const db = require('../models/index');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Get existing products with their names (the field we want to check for duplicates)
    const existingProducts = await db.Product.findAll({
      attributes: ['name']
    });
    
    // Create a Set of existing product names for faster lookup
    const existingProductNames = new Set(existingProducts.map(product => product.name));
    
    // Filter out products that already exist (by name)
    const newProducts = products.filter(product => !existingProductNames.has(product.name));
    
    // Only insert products that don't already exist
    if (newProducts.length > 0) {
      console.log(`Inserting ${newProducts.length} new products`);
      return queryInterface.bulkInsert('Products', newProducts);
    }
    
    console.log('No new products to insert');
    return Promise.resolve();
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Products', null, {});
  }
};