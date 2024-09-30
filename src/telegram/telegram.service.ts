import { Injectable, Inject } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Sequelize } from 'sequelize-typescript';
import { TimeSlotsService } from 'src/time_slots/time_slots.service';
import { LogService } from 'src/log/log.service';
import {
  TELEGRAM_REQUEST,
  TELEGRAM_VARIOUS_CALLBACKS,
  TELEGRAM_FACULTY_CALLBACKS,
  ITEMS_LIMIT,
  MAXIMUM_TEXT_LENGTH_LIMIT,
  ITEMS_IN_ROW,
  SUPPORT_USER_ID,
  REGULAR_EXPRESSIONS,
  BUTTON_TEXT_MAX_LENGTH,
  REQUEST_STATUS,
  BOT_COMMANDS,
} from 'src/constants';
import { UsersService } from 'src/users/users.service';
import { get_keyboards } from './keyboards';
import { RequestsService } from 'src/requests/requests.service';
import { get_texts } from './texts';

@Injectable()
export class TelegramService {
  constructor(
    @Inject(TELEGRAM_REQUEST)
    private readonly request: TelegramRequest,
    private readonly logService: LogService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersService: UsersService,
    private readonly requestsService: RequestsService,
    private readonly timeSlotsService: TimeSlotsService,
    private readonly sequelize: Sequelize,
  ) {}

  async onModuleInit() {
    await this.setWebhook();
    await this.getWebhook();
    await this.setMyCommands(BOT_COMMANDS);
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
    // #region pre-processing
    const { callback_query, message } = ctx;

    const user: BotUser | undefined = callback_query?.from || message?.from;

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
    // #end

    const text = callback_query?.message?.text || message?.text || '';
    const message_id = callback_query?.message?.message_id as number;
    const reply_to_message = message?.reply_to_message;

    try {
      await this.resolveUpdateUser(db_user, user);

      let is_bot_message_being_replied = reply_to_message?.from?.is_bot;
      if (reply_to_message && is_bot_message_being_replied)
        return this.resolveReplyToBotMessage(db_user, {
          reply_to_message,
          text,
        });
      let { is_professor, faculty } = db_user;

      //#region if user is "onboarded"
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
      }
      //#end

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
        case '/menu':
          let menu: Menu = db_user.is_professor
            ? 'professor_menu'
            : 'student_menu';
          return this.sendMessage(
            get_texts(menu, db_user.language_code),
            user.id,
            {
              reply_markup: {
                inline_keyboard: get_keyboards(menu, db_user.language_code),
              },
            },
          );
      }

      // #region callbacks

      let callback = callback_query?.data;
      if (callback) {
        this.logService.log(`callback`, callback);
        let menu = this.getMenu(db_user);
        if (REGULAR_EXPRESSIONS.professor_request.test(callback))
          return this.resolveRequestProfessorCallback(db_user, callback);
        if (
          callback === TELEGRAM_VARIOUS_CALLBACKS.professors ||
          REGULAR_EXPRESSIONS.list_professors.test(callback)
        )
          return this.resolveListProfessors(
            db_user,
            callback,
            menu,
            message_id,
          );
        if (REGULAR_EXPRESSIONS.open_request.test(callback))
          return this.resolveOpenRequest(db_user, callback, message_id);
        if (REGULAR_EXPRESSIONS.professor_decision.test(callback))
          return this.resolveProfessorDecision(db_user, callback, message_id);
        if (REGULAR_EXPRESSIONS.open_professor.test(callback))
          return this.resolveOpenProfessor(db_user, callback, message_id);
        if (REGULAR_EXPRESSIONS.professor_subscribe.test(callback))
          return this.resolveSubscribe(db_user, callback);
        if (REGULAR_EXPRESSIONS.professor_unsubscribe.test(callback))
          return this.resolveUnsubscribe(db_user, callback);
        if (REGULAR_EXPRESSIONS.list_professor_slots.test(callback))
          return this.listProfessorSlots(db_user, callback);
        if (REGULAR_EXPRESSIONS.book_professor_id_slot_id.test(callback))
          return this.bookSlot(db_user, callback);
        if (REGULAR_EXPRESSIONS.list_requests.test(callback))
          return this.resolveRequests(db_user, message_id, callback);

        switch (callback) {
          case TELEGRAM_VARIOUS_CALLBACKS.broadcast:
            return this.resolveBroadcast(db_user);
          case TELEGRAM_VARIOUS_CALLBACKS.set_time_slot:
            return this.resolveSetTimeSlotCallback(db_user);
          case TELEGRAM_VARIOUS_CALLBACKS.help:
            return this.resolveHelp(db_user, message_id);
          case TELEGRAM_VARIOUS_CALLBACKS.professor:
          case TELEGRAM_VARIOUS_CALLBACKS.student:
            return this.resolveChooseRole(db_user, callback, message_id);
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
            return this.resolveFacultyChoice(
              db_user,
              callback,
              menu,
              message_id,
            );
          case TELEGRAM_VARIOUS_CALLBACKS.faculty_second_page:
          case TELEGRAM_VARIOUS_CALLBACKS.faculty_first_page:
            return this.editMessageReplyMarkup(message_id, user.id, {
              reply_markup: {
                inline_keyboard: get_keyboards(callback, db_user.language_code),
              },
            });
          case TELEGRAM_VARIOUS_CALLBACKS.language:
            db_user.language_code =
              db_user.language_code === 'ru' ? 'en' : 'ru';
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
            return this.sendMessage(
              get_texts(menu, db_user.language_code),
              user.id,
              {
                reply_markup: {
                  inline_keyboard: get_keyboards(menu, db_user.language_code),
                },
              },
            );
          case TELEGRAM_VARIOUS_CALLBACKS.requests:
            return this.resolveRequests(db_user, message_id);
        }
      }

      return this.sendMessage(
        get_texts('help', db_user.language_code),
        user.id,
        {
          reply_markup: {
            inline_keyboard: get_keyboards('help', db_user.language_code),
          },
        },
      );
    } catch (err) {
      this.logService.err(`bot:`, err);
      await Promise.all([
        this.sendMessage(get_texts('error', db_user.language_code), user.id, {
          reply_markup: {
            inline_keyboard: get_keyboards('help', db_user.language_code),
          },
        }),
        this.sendMessage(
          `<b>There was an error in the bot</b>:\n\n`,
          SUPPORT_USER_ID,
        ),
      ]);
    }
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

  async resolveRequestSubmit(
    user: UsersAttributes,
    { reply_to_message, text }: { reply_to_message: Message; text: string },
  ) {
    let request_professor_reply = reply_to_message.text.match(
      REGULAR_EXPRESSIONS.request_professor_reply,
    );
    if (!request_professor_reply) {
      return;
    }
    if (text.length > MAXIMUM_TEXT_LENGTH_LIMIT)
      return this.sendMessage(
        get_texts('maximum_text_length_limit_exceeded', user.language_code),
        user.id,
      );
    let [, professor_id] = request_professor_reply;
    this.logService.log(`sending request to:`, professor_id);
    let student_name = this.resolveName(user);
    let text_to_professor = `Name: ${student_name}\nFaculty: ${user.faculty}\n\nRequest:\n\n${text}`;
    await Promise.all([
      this.requestsService.createRequest(user.id, professor_id, text),
      this.sendMessage(text_to_professor, professor_id),
      this.sendMessage(
        get_texts('request_successfully_sent', user.language_code),
        user.id,
      ),
    ]);
  }

  async resolveSubmitBroadcastMessage(
    user: UsersAttributes,
    { text }: { reply_to_message: Message; text: string },
  ) {
    let name = this.resolveName(user);
    let { rows: subscribers, count } =
      await this.subscriptionsService.getSubscribers(user.id);
    await Promise.all([
      subscribers.map(({ student_id }: { student_id: string }) =>
        this.sendMessage(
          `<b>Professor:</b> ${name}\nFaculty:<b>${user.faculty}</b>\n\nBroadcast message:\n\n${text}`,
          student_id,
        ),
      ),
    ]);
    let success_text =
      user.language_code === 'ru'
        ? `Успешно уведомили <b>${count}</b> студентов`
        : `Successfully notified <b>${count}</b> students`;
    return this.sendMessage(success_text, user.id, {
      reply_markup: {
        inline_keyboard: get_keyboards('professor_menu', user.language_code),
      },
    });
  }

  async resolveReplyToBotMessage(
    user: UsersAttributes,
    reply_data: { reply_to_message: Message; text: string },
  ) {
    if (
      REGULAR_EXPRESSIONS.request_professor_reply.test(
        reply_data.reply_to_message.text,
      )
    )
      return this.resolveRequestSubmit(user, reply_data);
    if (REGULAR_EXPRESSIONS.broadcast.test(reply_data.reply_to_message.text))
      return this.resolveSubmitBroadcastMessage(user, reply_data);
    if (
      REGULAR_EXPRESSIONS.time_slot_reply.test(reply_data.reply_to_message.text)
    )
      return this.resolveSetTimeSlot(user, reply_data.text);
  }

  resolveRequestProfessorCallback(user: UsersAttributes, callback: string) {
    let request_professor_callback = callback.match(
      REGULAR_EXPRESSIONS.professor_request,
    );
    let [, professor_id] = request_professor_callback as RegExpMatchArray;
    this.logService.log(`professor_id:`, professor_id);
    let request_professor_callback_text =
      user.language_code === 'ru'
        ? 'Добавьте комментарий или название к запросу. Будьте краткими, не превышайте лимит в 300 знаков'
        : `Add a comment or title to the request. Be concise, don't exceed 300 chars length limit`;
    return this.sendMessage(
      `#${professor_id}\n\n${request_professor_callback_text}`,
      user.id,
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
  }

  async resolveListProfessors(
    user: UsersAttributes,
    callback: string,
    menu: Menu,
    message_id: number,
  ) {
    let list_professors_callback = callback.match(
      REGULAR_EXPRESSIONS.list_professors,
    );

    let professor_request_page: number;
    if (list_professors_callback) {
      let [, professor_request_page_string] = list_professors_callback;
      professor_request_page = +professor_request_page_string;
    } else {
      professor_request_page = 1;
    }

    let { rows: professors_to_be_requested, count: professors_count } =
      await this.usersService.getUsersAndCount({
        where: {
          faculty: user.faculty,
          is_professor: true,
        },
        attributes: ['id', 'first_name', 'last_name', 'username'],
        offset: ITEMS_LIMIT * (professor_request_page - 1),
        limit: ITEMS_LIMIT,
      });
    if (!professors_to_be_requested.length) {
      let no_professors_text =
        user.language_code === 'ru'
          ? 'Не найдено профессоров из вашего факультета. Пригласите их.'
          : 'No professores from your faculty found so far :(\n\n Invite them!';
      return this.sendMessage(no_professors_text, user.id, {
        reply_markup: {
          inline_keyboard: get_keyboards(menu, user.language_code),
        },
      });
    }

    let professor_request_more_options =
      professors_count > professor_request_page * ITEMS_LIMIT;

    let professor_request_text =
      user.language_code === 'ru'
        ? 'Выберите профессора'
        : 'Choose a professor';
    let professor_request_more_options_text =
      user.language_code === 'ru' ? 'Ещё' : 'More';

    let professor_request_buttons: CustomCallbackButton[] =
      professors_to_be_requested.map(
        ({ id, first_name, last_name, username }: BasicUsersAttributes) => ({
          text: first_name
            ? last_name
              ? `${first_name} ${last_name}`
              : username
                ? `${first_name} ${username}`
                : first_name
            : id,
          callback_data: 'open_professor_' + id,
        }),
      );

    if (professor_request_more_options)
      professor_request_buttons.push({
        text: professor_request_more_options_text,
        callback_data: `list_professors_${professor_request_page + 1}`,
      });

    let keyboard: CustomKeyboard = [];

    for (
      let i = 0;
      i < professor_request_buttons.length;
      i = i + ITEMS_IN_ROW
    ) {
      let slice = professor_request_buttons.slice(i, ITEMS_IN_ROW);
      keyboard.push(slice);
    }

    return this.editMessageText(professor_request_text, message_id, user.id, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }
  async resolveUpdateUser(db_user: UsersAttributes, user: BotUser) {
    // check if telegam user info is different, and if so, update user in db
    const updateObj = {};
    for (const key in user) {
      // language preferences are stored in db, and updated in its own way
      if (key === 'is_bot' || key === 'id' || key === 'language_code') continue;
      if (user[key] !== db_user[key]) {
        Object.assign(updateObj, { [key]: user[key] });
      }
    }
    if (Object.keys(updateObj).length) {
      await this.usersService.updateUser(String(user.id), updateObj);
    }
  }
  getMenu(user: UsersAttributes): Menu {
    return user.is_professor ? 'professor_menu' : 'student_menu';
  }
  resolveHelp(user: UsersAttributes, message_id: number) {
    return this.editMessageText(
      get_texts(TELEGRAM_VARIOUS_CALLBACKS.help, user.language_code),
      message_id,
      user.id,
      {
        reply_markup: {
          inline_keyboard: get_keyboards(
            TELEGRAM_VARIOUS_CALLBACKS.help,
            user.language_code,
          ),
        },
      },
    );
  }
  async resolveChooseRole(
    user: UsersAttributes,
    callback:
      | TELEGRAM_VARIOUS_CALLBACKS.student
      | TELEGRAM_VARIOUS_CALLBACKS.professor,
    message_id: number,
  ) {
    let makes_sense_to_update: boolean =
      user.is_professor === null ||
      (callback === TELEGRAM_VARIOUS_CALLBACKS.student
        ? !!user.is_professor
        : !user.is_professor);

    let result: true | undefined;
    if (makes_sense_to_update) {
      result = await this.usersService.updateUser(String(user.id), {
        is_professor: callback === TELEGRAM_VARIOUS_CALLBACKS.professor,
      });
      if (result) {
        return this.editMessageText(
          get_texts('faculty', user.language_code),
          message_id,
          user.id,
          {
            reply_markup: {
              inline_keyboard: get_keyboards(
                'faculty_first_page',
                user.language_code,
              ),
            },
          },
        );
      }
    }

    let updated_menu: Menu =
      callback === TELEGRAM_VARIOUS_CALLBACKS.professor
        ? 'professor_menu'
        : 'student_menu';

    return this.editMessageText(
      get_texts(updated_menu, user.language_code),
      message_id,
      user.id,
      {
        reply_markup: {
          inline_keyboard: get_keyboards(updated_menu, user.language_code),
        },
      },
    );
  }
  async resolveFacultyChoice(
    user: UsersAttributes,
    callback: FacultyChoices,
    menu: Menu,
    message_id: number,
  ) {
    if (callback !== user.faculty) {
      await this.usersService.updateUser(String(user.id), {
        faculty: callback,
      });
    }
    return this.editMessageText(
      get_texts('faculty_chosen', user.language_code),
      message_id,
      user.id,
      {
        reply_markup: {
          inline_keyboard: get_keyboards(menu, user.language_code),
        },
      },
    );
  }
  async resolveRequests(user: UsersAttributes, message_id: number, callback?: string, ) {
    let page_number: number;
    if (!callback) {
      page_number = 1;
    } else {
      let [,page_number_str] =callback.match(REGULAR_EXPRESSIONS.list_requests) as RegExpMatchArray;
      page_number = +page_number_str;
    }

    let professor_requests_text =
      user.language_code === 'ru'
        ? `Нажмите, чтобы открыть запрос`
        : `Click to open the request`;

    let { rows: requests_data, count } =
      await this.requestsService.getRequests(user.is_professor ? {professor_id: user.id } : {student_id: user.id}, page_number);
    this.logService.log(`requestsData:`, requests_data);

    if (!count) {
      if (page_number > 1) {
        this.editMessageReplyMarkup(message_id, user.id, {
          reply_markup: {
            inline_keyboard: [[
              {
                text: get_texts('back', user.language_code), 
                callback_data: `list_requests_${page_number-1}`
              }
            ]]
          }
        });
      }
    }
    let requests_buttons: CustomCallbackButton[] =
      requests_data.map(
        ({ id, student_comment }: StudentRequestsAttributes) => ({
          text: student_comment.slice(0, 15),
          callback_data: `open_request_${id}`,
        }),
      );
      this.logService.log(`requests_buttons`, requests_buttons);
      let exists_more_student_requests_data = count > ITEMS_LIMIT * page_number;
    if (exists_more_student_requests_data) {
      requests_buttons.push({
        text: get_texts('more', user.language_code),
        callback_data: `list_requests_${page_number+1}`,
      });
    } else {
      if (page_number !== 1) 
        requests_buttons.push({
          text: get_texts('back', user.language_code),
          callback_data: `list_requests_${page_number-1}`,
        });
    }

    let requests_keyboard: CustomKeyboard = [];
    this.logService.log(`requests_keyboard:`, requests_keyboard);

    for (
      let i = 0;
      i < requests_buttons.length;
      i = i + ITEMS_IN_ROW
    ) {
      let slice = requests_buttons.slice(i, i+ITEMS_IN_ROW);
      requests_keyboard.push(slice);
    }
    this.logService.log(`reqeusts_keyboard_before_submit:`, requests_keyboard);
    return this.sendMessage(professor_requests_text, user.id, {
      reply_markup: { inline_keyboard: requests_keyboard },
    });

  }

  async resolveOpenRequest(
    user: UsersAttributes,
    callback: string,
    message_id: number,
  ) {
    let [, request_id] = callback.match(
      REGULAR_EXPRESSIONS.open_request,
    ) as RegExpMatchArray;
    let { id, student_comment, created_at, request_status } =
      (await this.requestsService.getRequest(request_id)) as RequestsAttributes;
    let keyboard: InlineKeyboard;
    let request_literal = user.language_code === 'ru' ? 'Запрос' : 'Request';
    let request_status_symbol: string;
    switch (request_status) {
      case REQUEST_STATUS.ACCEPTED:
        request_status_symbol = '🟢';
        break;
      case REQUEST_STATUS.REJECTED:
        request_status_symbol = '🔴';
        break;
      default:
        request_status_symbol = '🕔';
    }
    if (user.is_professor && request_status === REQUEST_STATUS.PENDING) {
      keyboard = [
        [
          {
            text: user.language_code === 'ru' ? 'Принять' : 'Accept',
            callback_data: 'accept_' + id,
          },
        ],
        [
          {
            text: user.language_code === 'ru' ? 'Отказать' : 'Reject',
            callback_data: 'reject_' + id,
          },
        ],
      ];
    } else {
      keyboard = get_keyboards('menu', user.language_code);
    }
    let date = this.getDate(created_at as Date);
    return this.editMessageText(
      `${request_literal} №${id}. ${request_status_symbol}\n\n${student_comment}\n\n${date}`,
      message_id,
      user.id,
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      },
    );
  }

  async resolveProfessorDecision(
    user: UsersAttributes,
    callback: string,
    message_id: number,
  ) {
    let [, decision, request_id] = callback.match(
      REGULAR_EXPRESSIONS.professor_decision,
    ) as RegExpMatchArray;
    let request_status =
      decision === 'accept' ? REQUEST_STATUS.ACCEPTED : REQUEST_STATUS.REJECTED;
    await this.requestsService.update(request_id, { request_status });
    let resolve_professor_decision_text =
      user.language_code === 'ru' ? 'Успешно' : 'Done';
    return this.editMessageText(
      resolve_professor_decision_text,
      message_id,
      user.id,
      {
        reply_markup: {
          inline_keyboard: get_keyboards('professor_menu', user.language_code),
        },
      },
    );
  }

  async resolveBroadcast(user: UsersAttributes) {
    let count = await this.subscriptionsService.count(user.id);
    let resolve_broadcast_text: string;
    if (!count) {
      resolve_broadcast_text =
        user.language_code === 'ru'
          ? 'У вас пока 0 подписчиков'
          : 'You have 0 subscribers so far';
      return this.sendMessage(resolve_broadcast_text, user.id, {
        reply_markup: {
          inline_keyboard: get_keyboards('professor_menu', user.language_code),
        },
      });
    }
    resolve_broadcast_text = `broadcast:${user.id}.\n\n`;
    resolve_broadcast_text +=
      user.language_code === 'ru'
        ? `Кол-во подписчиков: ${count}.\n\nОповестите их, ответив на это сообщение!`
        : `Subscribers count: ${count}.\n\nBroadcast a message to all of them by repling to this message!`;

    return this.sendMessage(resolve_broadcast_text, user.id, {
      reply_markup: {
        force_reply: true,
      },
    });
  }

  async resolveSetTimeSlot(user: UsersAttributes, text: string) {
    let [str1, str2] = text.split(' - ');
    let start_time: Date;
    let end_time: Date;
    try {
      start_time = this.parseDate(str1);
      end_time = this.parseDate(str2);
    } catch (err) {
      this.logService.log(`dates failed to parse`, `${text}`)
      return this.sendMessage("parser didn't recognize the dates.", user.id);
    }
    if (isNaN(start_time.getTime()) || isNaN(end_time.getTime())){
      return this.sendMessage("parser didn't recognize the dates.", user.id);
    }
    await this.timeSlotsService.createTimeSlot(user.id, start_time, end_time);
    let start_time_string = this.getDate(start_time);
    let end_time_string = this.getDate(end_time);
    let time_slot_is_set_text =
      user.language_code === 'ru'
        ? `Свободное окно успешно установлено.\n\nНачало: ${start_time_string}\nКонец: ${end_time_string}`
        : `The time slot was successfully set up.\n\nStarts at: ${start_time_string}\nEnds: ${end_time_string}`;
    return this.sendMessage(time_slot_is_set_text, user.id, {
      reply_markup: {
        inline_keyboard: get_keyboards('menu', user.language_code),
      },
    });
  }

  async resolveOpenProfessor(
    user: UsersAttributes,
    callback: string,
    message_id: number,
  ) {
    let [, professor_id] = callback.match(
      REGULAR_EXPRESSIONS.open_professor,
    ) as RegExpMatchArray;
    let { does_subscription_exist } = (await this.sequelize.query(
      `SELECT EXISTS (
        SELECT 1 FROM subscriptions 
        WHERE student_id = :student_id 
        AND professor_id = :professor_id
      ) does_subscription_exist;
        `,
      {
        replacements: {
          student_id: user.id,
          professor_id,
        },
        type: QueryTypes.SELECT,
        plain: true,
      },
    )) as { does_subscription_exist: boolean };
    let subscribe_button: CustomCallbackButton;
    if (does_subscription_exist) {
      subscribe_button = {
        text: 'Unsubscribe',
        callback_data: 'professor_unsubscribe_' + professor_id,
      };
    } else {
      subscribe_button = {
        text: 'Subscribe',
        callback_data: 'professor_subscribe_' + professor_id,
      };
    }

    return this.editMessageText(
      'book / request / subscribe',
      message_id,
      user.id,
      {
        reply_markup: {
          inline_keyboard: [
            [subscribe_button],
            [
              {
                text: 'Book a time slot',
                callback_data: 'list_professor_slots_' + professor_id + '_1',
              },
            ],
            [
              {
                text: 'Request',
                callback_data: 'professor_request_' + professor_id,
              },
            ],
          ],
        },
      },
    );
  }

  getDate(date: Date): string {
    return format(date, 'yy/MM/dd HH:mm', { locale: ru });
  }
  parseDate(date: string): Date {
    return parse(date, 'yy/MM/dd HH:mm', new Date());
  }

  async setMyCommands(commands: BotCommand[]) {
    return this.request('setMyCommands', { commands });
  }

  async resolveUnsubscribe(user: UsersAttributes, callback: string) {
    let [, professor_id] = callback.match(
      REGULAR_EXPRESSIONS.professor_unsubscribe,
    ) as RegExpMatchArray;
    let resolve_subscribe_text =
      user.language_code === 'ru'
        ? 'Вы отписались'
        : 'Successfully unsubscribed!';
    await this.subscriptionsService.unSubscribe(user.id, professor_id);
    return this.sendMessage(resolve_subscribe_text, user.id, {
      reply_markup: {
        inline_keyboard: get_keyboards('menu', user.language_code),
      },
    });
  }
  async resolveSubscribe(user: UsersAttributes, callback: string) {
    let [, professor_id] = callback.match(
      REGULAR_EXPRESSIONS.professor_subscribe,
    ) as RegExpMatchArray;
    let resolve_subscribe_text =
      user.language_code === 'ru'
        ? 'Вы подписались'
        : 'Successfully unsubscribed!';
    await this.subscriptionsService.subscribe(user.id, professor_id);
    return this.sendMessage(resolve_subscribe_text, user.id, {
      reply_markup: {
        inline_keyboard: get_keyboards('menu', user.language_code),
      },
    });
  }

  resolveSetTimeSlotCallback(user: UsersAttributes) {
    let eng_message = `Respond to this message by editing placeholder, according to the following format: yy/MM/dd HH:mm - yy/MM/dd HH:mm`;
    let ru_message = `#TS.\n\nОтветьте на это сообщение, редактируя помещенный текст согласно формате yy/MM/dd HH:mm - yy/MM/dd HH:mm`;
    let reply_text = `#TS.\n`;
    let input_field_placeholder = this.getDate(new Date()) + ' - ' + this.getDate(new Date());
    reply_text += user.languag_code === 'ru' ? ru_message : eng_message;
    reply_text += '\n\n'+input_field_placeholder;
    return this.sendMessage(reply_text, user.id, {
      reply_markup: {
        force_reply: true,
        input_field_placeholder
      },
    });
  }

  resolveName(user: UsersAttributes): string {
    let { first_name, last_name, username, id } = user;
    return first_name
      ? last_name
        ? `${first_name} ${last_name}`
        : username
          ? `${first_name} aka ${username}`
          : first_name
      : id;
  }

  async bookSlot(user: UsersAttributes, callback: string) {
    let [, professor_id, slot_id] = callback.match(REGULAR_EXPRESSIONS.book_professor_id_slot_id) as RegExpMatchArray;
    let {start_time, end_time} = await this.timeSlotsService.book(user.id, slot_id)
    let student_name = this.resolveName(user);
    let text = `${student_name} booked a time slot:\n\n${this.getDate(start_time)} - ${this.getDate(end_time)}`;
    await Promise.all([
      this.sendMessage(get_texts('success', user.language_code), user.id), 
      this.sendMessage(text, professor_id) 
    ])

  }

  async listProfessorSlots(user: UsersAttributes, callback: string) {
    let [,professor_id, page_number_str] = callback.match(REGULAR_EXPRESSIONS.list_professor_slots) as RegExpMatchArray;
    let page_number= +page_number_str;

    let {rows: time_slots, count} = await this.timeSlotsService.findAndCountAll({professor_id, page_number: +page_number});

    if (!count) {
      let text = user.language_code === 'ru' ? 
        'У этого профессора нет свободных окон пока что...' : 
        'this professor has no slots available so far...';
      return this.sendMessage(text, user.id, {
        reply_markup: {
          inline_keyboard: [[
            {
              text: get_texts('back', user.language_code), 
              callback_data: 'open_professor_'+professor_id
            }
          ]]
        }
      });
    }
    let text = user.language_code === 'ru' ? 'Выбери слот для брони' : 'Choose the slot to book';

    let exists_more_slots = count > +page_number * ITEMS_LIMIT;


      let time_slots_buttons: CustomCallbackButton[][] =
        time_slots.map(
          ({ id, start_time, end_time }: TimeSlots) => ([{
            text: this.getDate(start_time) + ' - ' + this.getDate(end_time),
            callback_data: `book_slot_${professor_id}_${id}`,
          }]),
        );

      if (exists_more_slots) {
        time_slots_buttons.push([{
          text: get_texts('more', user.language_code),
          callback_data: `list_professor_slots_${professor_id}_${page_number +1}`,
        }]);
      } else {
        if (page_number !==1 ) time_slots_buttons.push([{
          text: get_texts('back', user.language_code),
          callback_data: `list_professor_slots_${professor_id}_${page_number -1}`,
        }]);
      }

      return this.sendMessage(text, user.id, {
        reply_markup: { inline_keyboard: time_slots_buttons },
      });
    

  }
}
