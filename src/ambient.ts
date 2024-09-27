type Context = {
  update_id: number;
  channel_post?: {
    message_id: number;
    chat: {
      id: number;
      title: string;
      username: string;
      type: 'channel';
    };
  };
  pre_checkout_query: object;
  message?: {
    message_id: number;
    from: BotUser;
    chat: BotUser & {
      type: 'private' | 'group' | 'supergroup' | 'channel';
    };
    date: number;
    text?: string;
    entities?: Entity[];
    successful_payment?: {
      telegram_payment_charge_id: string;
      invoice_payload: string;
      total_amount: number;
    };
  };
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
  is_premium: boolean;
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

interface UsersAttributes {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  created_at?: Date;
}

type CreateUserDto = {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code: string;
};

//#endregion
