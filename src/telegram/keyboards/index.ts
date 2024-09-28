import { start } from './start';
import { help } from './help';
import { professor } from './professor';
import { student } from './student';

const keyboards = {
  start,
  help,
  professor,
  student,
};

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
