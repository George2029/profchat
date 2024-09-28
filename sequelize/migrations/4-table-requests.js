'use strict';
const { users, time_slots, requests } = require('../relations');
//const { REQUEST_STATUS } = require(

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(requests, {
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
      request_status: {
        allowNull: false,
        type: Sequelize.ENUM(['ACCEPTED', 'REJECTED', 'PENDING']),
        defaultValue: 'PENDING',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex(requests, ['professor_id']);
    await queryInterface.addIndex(requests, ['student_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable(requests);
  },
};
