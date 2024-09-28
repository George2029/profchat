'use strict';
const { users, faculties } = require('../relations');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(users, {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      language_code: {
        type: Sequelize.STRING,
        defaultValue: 'en',
        allowNull: false,
      },
      is_professor: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      faculty: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: faculties,
          key: 'slug',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable(users);
  },
};
