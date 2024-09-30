import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  exports: [SubscriptionsService],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
