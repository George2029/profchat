import { Injectable } from '@nestjs/common';
import { CONSOLE_COLORS } from '../constants';

@Injectable()
export class LogService {
  log(fnName: string, ...data: any[]) {
    console.log(
      CONSOLE_COLORS.BgBlue + `[${fnName}]:` + CONSOLE_COLORS.Reset,
      ...data,
    );
  }
  err(fnName: string, err: any) {
    console.error(
      CONSOLE_COLORS.BgRed + `[${fnName}]:` + CONSOLE_COLORS.Reset,
      err,
    );
  }

}
