import { TELEGRAM_REQUEST } from '../constants';
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
            logService.err('telegram', await res.json());
          }
          return res;
        } catch (err) {
          logService.err('telegramRequest', err);
          return err;
        }
      },
    inject: [LogService],
  },
];
