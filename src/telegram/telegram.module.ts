import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { telegramProviders } from './telegram.providers';
import { TimeSlotsModule } from 'src/time_slots/time_slots.module';
import { UsersModule } from 'src/users/users.module';
import { RequestsModule } from 'src/requests/requests.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
  imports: [UsersModule, RequestsModule, SubscriptionsModule, TimeSlotsModule],
  controllers: [TelegramController],
  providers: [TelegramService, ...telegramProviders],
})
export class TelegramModule {}
