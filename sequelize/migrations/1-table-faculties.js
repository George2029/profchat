'use strict';
const { faculties } = require('../relations');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(faculties, {
      slug: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: Sequelize.STRING,
      },
    });

  },
  async down(queryInterface) {
    await queryInterface.dropTable(faculties);
  },
};
