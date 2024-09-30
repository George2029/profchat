import {
  SOCIALS,
  TELEGRAM_FACULTY_CALLBACKS,
  TELEGRAM_VARIOUS_CALLBACKS,
  faculties,
} from 'src/constants';

let faculty_object: Record<FacultyChoices, string> = faculties.en;
let faculty_keys = Object.keys(faculty_object) as FacultyChoices[];
let faculty_buttons_array = faculty_keys.map(
  (key: FacultyChoices): [FacultyChoices, Button] => [
    key,
    {
      text: {
        en: faculties.en[key],
        ru: faculties.ru[key],
      },
      callback_data: TELEGRAM_FACULTY_CALLBACKS[key],
    },
  ],
);

let faculty_buttons_object = Object.fromEntries<Button>(
  faculty_buttons_array,
) as Record<FacultyChoices, Button>;

export const buttons: Buttons = {
  set_time_slot: {
    text: {
      en: 'Set a time slot',
      ru: 'Обозначить окно',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.set_time_slot,
  },
  professors: {
    text: {
      en: 'Professors',
      ru: 'Преподаватели'
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.professors,
  },
  subscribe: {
    text: {
      en: 'Subscribe',
      ru: 'Подписаться',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.subscribe,
  },
  professor: {
    text: {
      en: 'Professor',
      ru: 'Профессор',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.professor,
  },
  student: {
    text: {
      en: 'Student',
      ru: 'Студент',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.student,
  },
  help: {
    text: {
      en: 'Help',
      ru: 'Помощь',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.help,
  },
  report_bug: {
    text: {
      en: '🐛 Bug',
      ru: '🐛 Ошибка',
    },
    url: SOCIALS.manager,
  },
  feedback: {
    text: {
      en: '💡 Idea',
      ru: '💡 Идея',
    },
    url: SOCIALS.manager,
  },
  faculty: {
    text: {
      en: 'Change the faculty',
      ru: 'Сменить факультет',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.faculty,
  },
  broadcast: {
    text: {
      en: 'Broadcast a message',
      ru: 'Сделать уведомление',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.broadcast,
  },
  language: {
    text: {
      en: 'Switch language',
      ru: 'Сменить язык',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.language,
  },
  request: {
    text: {
      en: '📝 New request',
      ru: '📝 Новый запрос',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.request,
  },
  requests: {
    text: {
      en: '📝 Requests',
      ru: '📝 Запросы',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.requests,
  },
  book: {
    text: {
      en: '📅 Book',
      ru: '📅 Запись',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.book,
  },
  accept: {
    text: {
      en: '✅ Accept',
      ru: '✅ Принять',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.accept,
  },
  reject: {
    text: {
      en: '❌ Reject',
      ru: '❌ Отклонить',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.reject,
  },
  faculty_second_page: {
    text: {
      en: 'Show more',
      ru: 'Показать ещё',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.faculty_second_page,
  },
  faculty_first_page: {
    text: {
      en: 'Back',
      ru: 'Назад',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.faculty_first_page,
  },
  menu: {
    text: {
      en: 'Menu',
      ru: 'Меню',
    },
    callback_data: TELEGRAM_VARIOUS_CALLBACKS.menu,
  },
  ...faculty_buttons_object,
};
