import { Injectable, Inject } from '@nestjs/common';
import { Users, UsersAttributes } from 'src/database/models';
import { USERS_MODEL } from 'src/constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_MODEL)
    private readonly usersModel: typeof Users,
  ) {}

  getUser(id: string | number): Promise<UsersAttributes | null> {
    return this.usersModel.findByPk(id, { raw: true });
  }

  async createUser(create_user_dto: CreateUserDto): Promise<UsersAttributes> {
    return this.usersModel.create(create_user_dto, { raw: true });
  }
}
