import { SOCIALS, TELEGRAM_CALLBACK_QUERY_DATA } from 'src/constants';

export const buttons: Buttons = {
  professor: {
    text: {
      en: 'Professor',
      ru: 'Профессор',
    },
    callback_data: TELEGRAM_CALLBACK_QUERY_DATA.professor,
  },
  student: {
    text: {
      en: 'Student',
      ru: 'Студент',
    },
    callback_data: TELEGRAM_CALLBACK_QUERY_DATA.student,
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
};
