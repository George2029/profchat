import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { telegramProviders } from './telegram.providers';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService, ...telegramProviders],
})
export class TelegramModule {}
