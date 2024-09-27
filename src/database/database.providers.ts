import { USERS_MODEL } from 'src/constants';
import { Users } from './models/Users';

export const database_providers = [
  {
    useFactory: () => Users,
    provide: USERS_MODEL,
  },
];
