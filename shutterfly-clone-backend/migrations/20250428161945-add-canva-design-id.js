"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("UserImages", "canvaDesignId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UserImages", "canvaDesignUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("UserImages", "canvaDesignViewUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("UserImages", "canvaDesignId");
    await queryInterface.removeColumn("UserImages", "canvaDesignUrl");
    await queryInterface.removeColumn("UserImages", "canvaDesignViewUrl");
  },
};
