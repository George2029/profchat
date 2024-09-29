import { start } from './start';
import { help } from './help';
import { student } from './student';
import { faculty_first_page } from './faculty';
import { faculty_second_page } from './faculty_second_page';
import { professor_menu } from './professor_menu';
import { student_menu } from './student_menu';

const keyboards = {
  start,
  help,
  student,
  student_menu,
  professor_menu,
  faculty_first_page,
  faculty_second_page,
};

export type SendingKeyboard = keyof typeof keyboards;

export const get_keyboards = (
  tag: keyof typeof keyboards,
  language_code: string,
): InlineKeyboard => {
  const keyboard: Keyboard = keyboards[tag];

  const kbd = keyboard.map((row) =>
    row.map((button: Button) => ({
      ...button,
      text: button.text[language_code] || button.text['en'],
    })),
  );
  return kbd;
};
