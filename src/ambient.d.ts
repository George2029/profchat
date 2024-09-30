type Chat = {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: boolean;
};

type Message = {
  message_id: number;
  date: number;
  chat: Chat;
  text: string;
  author_signature?: string;
  entities?: Entity;
  from?: BotUser; // empty for messages sent to channels. contains a fake sender user in non-channel chats,
  sender_chat?: Chat;
  reply_to_message?: Message;
  message_thread_id?: number;
  entities?: Entity[];
  successful_payment?: {
    telegram_payment_charge_id: string;
    invoice_payload: string;
    total_amount: number;
  };
};

type Context = {
  update_id: number;
  channel_post?: {
    message_id: number;
    chat: Chat;
  };
  pre_checkout_query: object;
  message?: Message;
  callback_query?: {
    from: BotUser;
    message: Context['message'];
    data: string;
  };
  update?: {
    message?: {
      successful_payment?: object;
    };
  };
  answerPreCheckoutQuery?: (ok: boolean) => Promise<void>;
  reply?: (text: string) => Promise<void>;
};

type MessageParams = {
  parse_mode?: 'HTML' | 'MarkdownV2';
  link_preview_options?: { is_disabled: boolean };
  reply_markup?: {
    inline_keyboard?: InlineKeyboard;
    force_reply?: true;
    input_field_placeholder?: string;
  };
};
type InlineKeyboard = {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
}[][];
type BotUser = {
  id: number;
  is_bot: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: true;
};
type Entity = {
  type: EntityType;
  offset: number;
  length: number;
  url: string;
  user: BotUser;
  language: string;
  custom_emoji_id: string;
};
type EntityType =
  | 'mention'
  | 'hashtag'
  | 'cashtag'
  | 'bot_command'
  | 'url'
  | 'email'
  | 'phone_number'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'spoiler'
  | 'blockquote'
  | 'code'
  | 'pre'
  | 'text_link'
  | 'text_mention'
  | 'custom_emoji';

type TelegramRequest = (
  method: string,
  body?: Record<any, any>,
  config?: Omit<RequestInit, 'body' | 'method'>,
) => Promise<any>;

type CreateUserDto = {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code: string;
};

type TelegramAllCallbacks = import('src/constants').TelegramAllCallbacks;
type SupportedLanguage = 'en' | 'ru';

type Button = {
  text: Record<SupportedLanguage, string>;
  web_app?: { url: string };
  callback_data?: TelegramAllCallbacks;
  url?: string;
};

type CustomCallbackButton = {
  text: string;
  callback_data: string;
};

type User = import('src/database/models').UsersAttributes;
type UsersAttributes = Omit<UsersAttributes, 'language_code'> & {
  language_code: string;
};

type BasicUsersAttributes = Pick<
  UsersAttributes,
  'id' | 'first_name' | 'last_name' | 'username'
>;
type FacultyChoices = import('src/constants').TelegramFacultyCallbacks;

type SupportChoices = 'report_bug' | 'feedback';
type SupportedButtons = SupportChoices | TelegramAllCallbacks;

type FacultyCallbacks = Record<
  SupportedLanguage,
  Record<FacultyChoices, string>
>;

type Buttons = Record<SupportedButtons, Button>;

type Keyboard = Button[][];
type CustomKeyboard = CustomCallbackButton[][];

type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
type RequestsAttributes = import('src/database/models').RequestsAttributes;
type SubscriptionsAttributes =
  import('src/database/models').SubscriptionsAttributes;
type StudentRequestsAttributes = Pick<
  RequestsAttributes,
  'id',
  'student_comment'
>;
type Menu = 'professor_menu' | 'student_menu';

type BotCommand = {
  command: string;
  description: string;
};
type TimeSlots = Pick<import('src/database/models').TimeSlotsAttributes, 'id', 'start_time', 'end_time'>
