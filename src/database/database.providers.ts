import { USERS_MODEL, REQUESTS_MODEL, TIME_SLOTS_MODEL } from 'src/constants';
import { Users, TimeSlots, Requests } from './models';

export const database_providers = [
  {
    useFactory: () => Users,
    provide: USERS_MODEL,
  },
  {
    useFactory: () => TimeSlots,
    provide: TIME_SLOTS_MODEL,
  },
  {
    useFactory: () => Requests,
    provide: REQUESTS_MODEL,
  },
];
