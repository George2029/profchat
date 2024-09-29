export const USERS_MODEL = 'USERS_MODEL' as const;
export const TIME_SLOTS_MODEL = 'TIME_SLOTS_MODEL' as const;
export const REQUESTS_MODEL = 'REQUESTS_MODEL';

export enum SOCIALS {
  manager = 'https://t.me/kasparov777',
}

export const faculties: FacultyCallbacks = {
  en: {
    biological_institute: 'Biological Institute',
    economics_and_management: 'Economics & Management',
    applied_mathematics_and_cs: 'Applied Mathematics & CS',
    higher_it_school: 'Higher IT School',
    institute_of_law: 'Institute of Law',
    geology_and_geography: 'Geology & Geography',
    mechanics_and_mathematics: 'Mechanics & Mathematics',
    radiophysics: 'Radiophysics',
    journalism: 'Journalism',
    foreign_languages: 'Foreign Languages',
    innovative_technologies: 'Innovative Technologies',
    history_and_ps: 'History & PS',
    psychology: 'Psychology',
    physical_education: 'Physical Education',
    physics_and_engineering: 'Physics & Engineering',
    physics: 'Physics',
  },
  ru: {
    biological_institute: 'Биологический институт',
    economics_and_management: 'Экономика и управление',
    applied_mathematics_and_cs: 'Прикладная математика и ИТ',
    higher_it_school: 'Высшая школа ИТ',
    institute_of_law: 'Юридический институт',
    geology_and_geography: 'Геология и география',
    mechanics_and_mathematics: 'Механика и математика',
    radiophysics: 'Радиофизика',
    journalism: 'Журналистика',
    foreign_languages: 'Иностранные языки',
    innovative_technologies: 'Инновационные технологии',
    history_and_ps: 'История и политология',
    psychology: 'Психология',
    physical_education: 'Физическое воспитание',
    physics_and_engineering: 'Физика и инженерия',
    physics: 'Физика',
  },
} as const;

export enum TELEGRAM_VARIOUS_CALLBACKS {
  professor = 'professor',
  student = 'student',

  menu = 'menu',
  faculty_first_page = 'faculty_first_page',

  request = 'request',
  requests = 'requests',

  book = 'book',
  broadcast = 'broadcast',
  language = 'language',
  faculty = 'faculty',

  accept = 'accept',
  reject = 'reject',

  help = 'help',
  faculty_second_page = 'faculty_second_page',
}

export enum TELEGRAM_FACULTY_CALLBACKS {
  biological_institute = 'biological_institute',
  economics_and_management = 'economics_and_management',
  applied_mathematics_and_cs = 'applied_mathematics_and_cs',
  higher_it_school = 'higher_it_school',
  institute_of_law = 'institute_of_law',
  geology_and_geography = 'geology_and_geography',
  mechanics_and_mathematics = 'mechanics_and_mathematics',
  radiophysics = 'radiophysics',
  journalism = 'journalism',
  foreign_languages = 'foreign_languages',
  innovative_technologies = 'innovative_technologies',
  history_and_ps = 'history_and_ps',
  psychology = 'psychology',
  physical_education = 'physical_education',
  physics_and_engineering = 'physics_and_engineering',
  physics = 'physics',
}

export type TelegramFacultyCallbacks = `${TELEGRAM_FACULTY_CALLBACKS}`;

export type TelegramVariousCallbacks = `${TELEGRAM_VARIOUS_CALLBACKS}`;

export type TelegramAllCallbacks =
  | TelegramFacultyCallbacks
  | TelegramVariousCallbacks;

export const TELEGRAM_REQUEST = 'TELEGRAM_REQUEST';

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
