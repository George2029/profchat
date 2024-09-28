import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'src/log/log.service';
import { TELEGRAM_REQUEST, TELEGRAM_CALLBACK_QUERY_DATA } from 'src/constants';
import { UsersService } from 'src/users/users.service';
import { get_keyboards } from './keyboards';
import { get_texts, Text } from './texts';

@Injectable()
export class TelegramService {
  constructor(
    @Inject(TELEGRAM_REQUEST)
    private readonly request: TelegramRequest,
    private readonly logService: LogService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    await this.setWebhook();
    await this.getWebhook();
  }

  async setWebhook() {
    this.logService.log(
      'setWebhook:webhook',
      process.env.ORIGIN + process.env.WEBHOOK_PATH,
    );
    const result = await this.request('setWebhook', {
      url: process.env.ORIGIN + process.env.WEBHOOK_PATH,
    });
    if ('json' in result)
      this.logService.log('setWebhook:result', await result.json());
  }

  async handleTelegramWebhook(ctx: Context) {
    const { callback_query, message } = ctx;

    const user: BotUser | undefined = callback_query?.from || message?.from;
    const text = callback_query?.message?.text || message?.text || '';
    if (!user?.id) return;

    let db_user = await this.usersService.getUser(user.id);

    if (!db_user) {
      const create_user_dto: CreateUserDto = {
        id: String(user.id),
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
      };

      db_user = await this.usersService.createUser(create_user_dto);
    }

    switch (text) {
      case '/help':
      case '/start':
        let command = text.slice(1) as Text;
        return this.sendMessage(
          get_texts(command, user.language_code),
          user.id,
          {
            reply_markup: {
              inline_keyboard: get_keyboards(command, user.language_code),
            },
          },
        );
    }

    let callback = callback_query?.data;
    if (callback && callback in TELEGRAM_CALLBACK_QUERY_DATA) {
      switch (callback) {
        case TELEGRAM_CALLBACK_QUERY_DATA.professor:
        case TELEGRAM_CALLBACK_QUERY_DATA.student:
          return this.sendMessage(
            get_texts(callback, user.language_code),
            user.id,
            {
              reply_markup: {
                inline_keyboard: get_keyboards(callback, user.language_code),
              },
            },
          );
      }
    }

    let { is_professor, faculty } = db_user;

    return this.sendMessage(`hello there. you said ${text}`, user.id);
  }

  async getWebhook() {
    const result = await this.request('getWebhookInfo');

    if ('json' in result)
      this.logService.log('getWebhook:result', await result.json());
  }

  sendMessage(
    text: string,
    chat_id: string | number,
    params: MessageParams = {},
  ) {
    const defaults: typeof params = {
      parse_mode: 'HTML',
    };
    Object.assign(defaults, params);
    return this.request('sendMessage', {
      chat_id,
      text,
      ...defaults,
    });
  }
}
