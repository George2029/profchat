import { help } from './help';
import { start } from './start';
import { professor } from './professor';
import { student } from './student';

const texts = {
  start,
  help,
  professor,
  student,
};

export type Text = keyof typeof texts;

export const get_texts = (tag: Text, language_code: string) => {
  const text = texts[tag];
  return text[language_code] || text['en'];
};
