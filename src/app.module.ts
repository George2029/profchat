import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [TelegramModule, DatabaseModule, UsersModule, LogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
