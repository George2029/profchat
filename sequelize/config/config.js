require('dotenv').config();

const dialect = 'postgresql';
const production_dialectOptions = {
  require: true,
  rejectUnauthorized: false,
};

const dialectOptions = {};

const [
  ,
  ,
  production_username,
  production_password,
  production_host,
  production_port,
  production_database,
] = process.env.DATABASE_URI.match(
  /([^:]*):\/\/([^:]*):([^@]*)@([^:]*):(\d+)\/(.*)/,
);

const [, , username, password, host, port, database] =
  process.env.TEST_DATABASE_URI.match(
    /([^:]*):\/\/([^:]*):([^@]*)@([^:]*):(\d+)\/(.*)/,
  );

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    port,
    dialect,
    dialectOptions,
  },
  production: {
    username: production_username,
    password: production_password,
    database: production_database,
    host: production_host,
    port: production_port,
    dialect,
    dialectOptions: production_dialectOptions,
  },
};
