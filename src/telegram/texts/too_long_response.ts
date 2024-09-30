import { MAXIMUM_TEXT_LENGTH_LIMIT } from 'src/constants';

export const maximum_text_length_limit_exceeded = {
  en: `<b>Exceeded the maximum length of text.</b>\n\nWanted no more than ${MAXIMUM_TEXT_LENGTH_LIMIT} characters`,

  ru: `<b>Превышена максимальная длина текста.</b>\n\nОжидалось не больше ${MAXIMUM_TEXT_LENGTH_LIMIT} знаков`,
};
