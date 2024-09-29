import { help } from './help';
import { start } from './start';
import { student_menu } from './student_menu';
import { faculty } from './faculty';
import { professor_menu } from './professor_menu';
import { faculty_chosen } from './faculty_chosen';
import { error } from './error';

const texts = {
  start,
  help,
  faculty,
  faculty_chosen,
  student_menu,
  professor_menu,
  error,
};

export type SendingText = keyof typeof texts;

export const get_texts = (tag: SendingText, language_code: string) => {
  const text = texts[tag];
  return text[language_code] || text['en'];
};
