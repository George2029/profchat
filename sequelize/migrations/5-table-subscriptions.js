'use strict';
const { users, subscriptions } = require('../relations');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(subscriptions, {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      professor_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: { model: users },
      },
      student_id: {
        allowNull: false,
        defaultValue: null,
        type: Sequelize.BIGINT,
        references: { model: users },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex(subscriptions, ['professor_id']);
    await queryInterface.addIndex(subscriptions, ['student_id']);
    await queryInterface.addIndex(subscriptions, ['student_id', 'professor_id'], {unique: true});
  },
  async down(queryInterface) {
    await queryInterface.dropTable(subscriptions);
  },
};
