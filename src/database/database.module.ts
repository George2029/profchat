import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { database_providers } from './database.providers';
import * as db_models from './models';

let uri =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URI
    : process.env.TEST_DATABASE_URI;

@Global()
@Module({
  imports: [
    SequelizeModule.forRoot({ 
      uri, 
      models:  Object.keys(db_models)
      .map((prop) => db_models[prop]),
    })
  ],
  providers: database_providers,
  exports: database_providers,
})
export class DatabaseModule {}
