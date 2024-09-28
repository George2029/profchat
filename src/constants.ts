export const USERS_MODEL = 'USERS_MODEL' as const;
export enum SOCIALS {
  manager = 'https://t.me/kasparov777',
}
export enum TELEGRAM_CALLBACK_QUERY_DATA {
  professor = 'professor',
  student = 'student',
}
export const TELEGRAM_REQUEST = 'TELEGRAM_REQUEST';
export enum REQUEST_STATUS {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}
export enum CONSOLE_COLORS {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',

  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',
  FgGray = '\x1b[90m',

  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
  BgGray = '\x1b[100m',
}
export const LOGGING_CONFIG = {
  benchmark: true,
  logging: (sql: string, timing: number | undefined) => {
    console.log(
      CONSOLE_COLORS.BgCyan,
      'SQL Request body:',
      CONSOLE_COLORS.Reset,
      sql,
    );
    console.log(
      CONSOLE_COLORS.BgGreen,
      'SQL Elapsed time:',
      CONSOLE_COLORS.Reset,
      timing + 'ms',
    );
    console.log(
      CONSOLE_COLORS.BgBlue,
      '==================',
      CONSOLE_COLORS.Reset,
    );
  },
} as const;
