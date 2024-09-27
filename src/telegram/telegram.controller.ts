import { Body, Controller, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller(process.env.WEBHOOK_PATH)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post()
  handleTelegramWebhook(@Body() ctx: Context) {
    return this.telegramService.handleTelegramWebhook(ctx);
  }
}
