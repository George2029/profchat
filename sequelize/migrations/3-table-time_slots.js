'use strict';
const { users, time_slots } = require('../relations');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(time_slots, {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      professor_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {model: users}
      },
      student_id: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.BIGINT,
        references: {model: users}
      },
      start_time: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      end_time: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex(time_slots, ['professor_id'])
  },
  async down(queryInterface) {
    await queryInterface.dropTable(time_slots);
  },
};
