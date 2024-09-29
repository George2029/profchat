import { Injectable, Inject } from '@nestjs/common';
import { Users, UsersAttributes } from 'src/database/models';
import { USERS_MODEL } from 'src/constants';
import { LogService } from 'src/log/log.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_MODEL)
    private readonly usersModel: typeof Users,
    private readonly logService: LogService,
  ) {}

  getUser(id: string | number): Promise<UsersAttributes | null> {
    return this.usersModel.findByPk(id, { raw: true });
  }

  async createUser(create_user_dto: CreateUserDto): Promise<UsersAttributes> {
    return this.usersModel.create(create_user_dto, { raw: true });
  }

  async updateUser(
    user_id: string,
    values: { [key in keyof UsersAttributes]?: UsersAttributes[key] },
  ) {
    try {
      await this.usersModel.update(values, {
        where: { id: user_id },
      });
      return true;
    } catch (error) {
      this.logService.err(`updateUser`, error);
    }
  }
}
