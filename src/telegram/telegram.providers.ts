import { TELEGRAM_REQUEST } from '../constants';
import { BadRequestException } from '@nestjs/common';
import { LogService } from '../log/log.service';

export const telegramProviders = [
  {
    provide: TELEGRAM_REQUEST,
    useFactory:
      (logService: LogService): TelegramRequest =>
      async (
        method: string,
        body: Record<any, any> = {},
        config: Omit<RequestInit, 'body' | 'method'> = {},
      ) => {
        try {
          //logService.log('body', body);
          const res = await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}`,
            {
              method: 'POST',
              body: JSON.stringify(body),
              ...config,
              headers: {
                'Content-Type': 'application/json',
                ...config.headers,
              },
            },
          );
          if (!res.ok) {
            let msg = await res.json();
            logService.err('telegram', msg);
            throw new BadRequestException(msg);
          }
          return res;
        } catch (err) {
          logService.err('telegramRequest', err);
          throw err;
        }
      },
    inject: [LogService],
  },
];
