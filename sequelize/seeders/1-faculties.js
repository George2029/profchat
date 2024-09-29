'use strict';
const { faculties } = require('../relations');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO faculties (slug) VALUES
        ('biological_institute'),
        ('economics_and_management'),
        ('applied_mathematics_and_cs'),
        ('higher_it_school'),
        ('institute_of_law'),
        ('geology_and_geography'),
        ('mechanics_and_mathematics'),
        ('radiophysics'),
        ('journalism'),
        ('foreign_languages'),
        ('innovative_technologies'),
        ('history_and_ps'),
        ('psychology'),
        ('physical_education'),
        ('physics_and_engineering'),
        ('physics')

      `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(`
    TRUNCATE TABLE ${faculties} RESTART IDENTITY;
    `);
  },
};
