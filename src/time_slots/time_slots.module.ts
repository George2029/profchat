import { Module } from '@nestjs/common';
import { TimeSlotsService } from './time_slots.service';

@Module({
  exports: [TimeSlotsService],
  providers: [TimeSlotsService],
})
export class TimeSlotsModule {}
