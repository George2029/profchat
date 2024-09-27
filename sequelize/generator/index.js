require('dotenv').config();

let db_config = require('../config/config.js');

const {
  DialectPostgres,
  ModelBuilder,
} = require('sequelize-typescript-generator');

(async () => {
  const config = {
    connection: db_config[process.env.NODE_ENV || 'development'],
    metadata: {
      indices: true,
      case: {
        model: 'PASCAL',
        column: 'UNDERSCORE',
      },
    },
    output: {
      clean: true,
      outDir: 'src/database/models/',
    },
    strict: true,
  };

  const dialect = new DialectPostgres();

  const builder = new ModelBuilder(config, dialect);

  try {
    await builder.build();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
