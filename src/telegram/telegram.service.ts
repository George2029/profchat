import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'src/log/log.service';
import {
  TELEGRAM_REQUEST,
  TELEGRAM_VARIOUS_CALLBACKS,
  TELEGRAM_FACULTY_CALLBACKS,
} from 'src/constants';
import { UsersService } from 'src/users/users.service';
import { get_keyboards } from './keyboards';
import { get_texts } from './texts';

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
    try {
      let msg = await result.json();
      this.logService.log('setWebhook:result', msg);
    } catch {
      this.logService.log('setWebhook:result', result);
    }
  }

  async handleTelegramWebhook(ctx: Context) {
    console.log(ctx);
    const { callback_query, message } = ctx;

    const user: BotUser | undefined = callback_query?.from || message?.from;
    const text = callback_query?.message?.text || message?.text || '';
    const message_id = callback_query?.message?.message_id as number;
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

    console.log(db_user);

    if (!db_user) return;

    const updateObj = {};
    for (const key in user) {
      if (key === 'is_bot' || key === 'id' || key === 'language_code') continue;
      if (user[key] !== db_user[key]) {
        Object.assign(updateObj, { [key]: user[key] });
      }
    }
    if (Object.keys(updateObj).length) {
      await this.usersService.updateUser(String(user.id), updateObj);
    }

    switch (text) {
      case '/help':
      case '/start':
        let command = text.slice(1) as 'help' | 'start';
        return this.sendMessage(
          get_texts(command, db_user.language_code),
          user.id,
          {
            reply_markup: {
              inline_keyboard: get_keyboards(command, db_user.language_code),
            },
          },
        );
    }

    let callback = callback_query?.data;
    if (callback) {
      this.logService.log(`callback`, callback);
      let menu: 'professor_menu' | 'student_menu' = db_user.is_professor ? 'professor_menu' : 'student_menu';
      switch (callback) {
        case TELEGRAM_VARIOUS_CALLBACKS.help:
          return this.editMessageText(
            get_texts(callback, db_user.language_code),
            message_id,
            user.id,
            {
              reply_markup: {
                inline_keyboard: get_keyboards(callback, db_user.language_code),
              },
            },
          );
        case TELEGRAM_VARIOUS_CALLBACKS.professor:
        case TELEGRAM_VARIOUS_CALLBACKS.student:
          let makes_sense_to_update =
            db_user.is_professor === null ||
            callback === TELEGRAM_VARIOUS_CALLBACKS.student
              ? db_user.is_professor
              : !db_user.is_professor;

          let result: true | undefined;
          if (makes_sense_to_update) {
            result = await this.usersService.updateUser(String(user.id), {
              is_professor: callback === TELEGRAM_VARIOUS_CALLBACKS.professor,
            });
            if (!result) {
              return this.editMessageText(
                get_texts('error', db_user.language_code),
                message_id,
                user.id,
                {
                  reply_markup: {
                    inline_keyboard: get_keyboards('help', db_user.language_code),
                  },
                },
              );
            }
          }

          let updated_menu: 'student_menu' | 'professor_menu' = callback === TELEGRAM_VARIOUS_CALLBACKS.professor ? 'professor_menu' : 'student_menu';

          return this.editMessageText(
            get_texts(updated_menu, db_user.language_code),
            message_id,
            user.id,
            {
              reply_markup: {
                inline_keyboard: get_keyboards(updated_menu, db_user.language_code),
              },
            },
          );
        case TELEGRAM_FACULTY_CALLBACKS.biological_institute:
        case TELEGRAM_FACULTY_CALLBACKS.economics_and_management:
        case TELEGRAM_FACULTY_CALLBACKS.applied_mathematics_and_cs:
        case TELEGRAM_FACULTY_CALLBACKS.higher_it_school:
        case TELEGRAM_FACULTY_CALLBACKS.institute_of_law:
        case TELEGRAM_FACULTY_CALLBACKS.geology_and_geography:
        case TELEGRAM_FACULTY_CALLBACKS.mechanics_and_mathematics:
        case TELEGRAM_FACULTY_CALLBACKS.radiophysics:
        case TELEGRAM_FACULTY_CALLBACKS.journalism:
        case TELEGRAM_FACULTY_CALLBACKS.foreign_languages:
        case TELEGRAM_FACULTY_CALLBACKS.innovative_technologies:
        case TELEGRAM_FACULTY_CALLBACKS.history_and_ps:
        case TELEGRAM_FACULTY_CALLBACKS.psychology:
        case TELEGRAM_FACULTY_CALLBACKS.physical_education:
        case TELEGRAM_FACULTY_CALLBACKS.physics_and_engineering:
        case TELEGRAM_FACULTY_CALLBACKS.physics:
          if (callback !== db_user.faculty) {
            await this.usersService.updateUser(String(user.id), {
              faculty: callback,
            });
          }
          return this.editMessageText(
            get_texts('faculty_chosen', db_user.language_code),
            message_id,
            user.id,
            {
              reply_markup: {
                inline_keyboard: get_keyboards(menu, db_user.language_code),
              },
            },
          );
        case TELEGRAM_VARIOUS_CALLBACKS.faculty_second_page:
        case TELEGRAM_VARIOUS_CALLBACKS.faculty_first_page:
          return this.editMessageReplyMarkup(message_id, user.id, {
            reply_markup: {
              inline_keyboard: get_keyboards(callback, db_user.language_code),
            },
          });
        case TELEGRAM_VARIOUS_CALLBACKS.language:
          db_user.language_code = db_user.language_code === 'ru' ? 'en' : 'ru';
          await this.usersService.updateUser(String(user.id), {
            language_code: db_user.language_code,
          });
          return this.editMessageText(
            get_texts('help', db_user.language_code),
            message_id,
            user.id,
            {
              reply_markup: {
                inline_keyboard: get_keyboards('help', db_user.language_code),
              },
            },
          );
        case TELEGRAM_VARIOUS_CALLBACKS.faculty:
          return this.editMessageText(
            get_texts('faculty', db_user.language_code),
            message_id,
            user.id,
            {
              reply_markup: {
                inline_keyboard: get_keyboards(
                  TELEGRAM_VARIOUS_CALLBACKS.faculty_first_page,
                  db_user.language_code,
                ),
              },
            },
          );
        case TELEGRAM_VARIOUS_CALLBACKS.menu:
          return this.editMessageText(
            get_texts(menu, db_user.language_code),
            message_id,
            user.id,
            {
              reply_markup: {
                inline_keyboard: get_keyboards(menu, db_user.language_code),
              },
            },
          );
      }
    }

    let { is_professor, faculty } = db_user;
    if (is_professor === null) {
      return this.sendMessage(
        get_texts('start', db_user.language_code),
        user.id,
        {
          reply_markup: {
            inline_keyboard: get_keyboards('start', db_user.language_code),
          },
        },
      );
    }

    if (faculty === null) {
      try {
        return this.sendMessage(
          get_texts('faculty', db_user.language_code),
          user.id,
          {
            reply_markup: {
              inline_keyboard: get_keyboards(
                TELEGRAM_VARIOUS_CALLBACKS.faculty_first_page,
                db_user.language_code,
              ),
            },
          },
        );
      } catch (err) {
        this.logService.err('facultyProcessCallback', err);

        return this.sendMessage(
          get_texts('help', db_user.language_code),
          user.id,
          {
            reply_markup: {
              inline_keyboard: get_keyboards('help', db_user.language_code),
            },
          },
        );
      }
    }

    return this.sendMessage(get_texts('help', db_user.language_code), user.id, {
      reply_markup: {
        inline_keyboard: get_keyboards('help', db_user.language_code),
      },
    });
  }

  async getWebhook() {
    const result = await this.request('getWebhookInfo');
    try {
      let msg = await result.json();
      this.logService.log('setWebhook:result', msg);
    } catch {
      this.logService.log('setWebhook:result', result);
    }
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

  editMessageReplyMarkup(
    message_id: number,
    chat_id: string | number,
    params: MessageParams = {},
  ) {
    return this.request('editMessageReplyMarkup', {
      message_id,
      chat_id,
      ...params,
    });
  }

  editMessageText(
    text: string,
    message_id: number,
    chat_id: string | number,
    params: MessageParams = {},
  ) {
    const defaults: typeof params = {
      parse_mode: 'HTML',
    };
    Object.assign(defaults, params);
    return this.request('editMessageText', {
      chat_id,
      message_id,
      text,
      ...defaults,
    });
  }
}
