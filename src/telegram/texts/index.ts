import { help } from './help';
import { start } from './start';
import { maximum_text_length_limit_exceeded } from './too_long_response';
import { request_successfully_sent } from './request_successfully_sent';
import { student_menu } from './student_menu';
import { faculty } from './faculty';
import { professor_menu } from './professor_menu';
import { no_student_requests } from './no_student_requests';
import { no_professor_requests } from './no_professor_requests';
import { more } from './more';
import { faculty_chosen } from './faculty_chosen';
import { error } from './error';
import { back } from './back';
import { success } from './success';

const texts = {
  start,
  help,
  faculty,
  faculty_chosen,
  student_menu,
  professor_menu,
  error,
  maximum_text_length_limit_exceeded,
  request_successfully_sent,
  no_student_requests,
  no_professor_requests,
  more,
  success,
  back,
};

export type SendingText = keyof typeof texts;

export const get_texts = (tag: SendingText, language_code: string) => {
  const text = texts[tag];
  return text[language_code] || text['en'];
};
