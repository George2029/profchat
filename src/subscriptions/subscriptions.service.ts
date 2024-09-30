import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { QueryTypes } from 'sequelize';
import { SUBSCRIPTIONS_MODEL } from 'src/constants';
import { Subscriptions } from 'src/database/models';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(SUBSCRIPTIONS_MODEL)
    private readonly subscriptionsModel: typeof Subscriptions,
    private readonly sequelize: Sequelize,
  ) {}

  subscribe(student_id: string, professor_id: string) {
    return this.subscriptionsModel.create(
      { student_id, professor_id },
      { returning: false },
    );
  }

  //getSubscriptions(
  //  student_id: string,
  //  page_number: number = 1,
  //): Promise<{ rows: SubscriptionsAttributes[]; count: number }> {
  //  return this.subscriptionsModel.findAndCountAll({
  //    where: { student_id },
  //    limit: ITEMS_LIMIT,
  //    offset: page_number * ITEMS_LIMIT - ITEMS_LIMIT,
  //  });
  //}

  async count(professor_id: string): Promise<number> {
    let { count } = (await this.sequelize.query(
      `
        SELECT COUNT(*)::int count 
        FROM subscriptions
        WHERE professor_id = :professor_id
      `,
      {
        replacements: {
          professor_id,
        },
        type: QueryTypes.SELECT,
        plain: true,
      },
    )) as { count: number };
    return count;
  }

  getSubscribers(professor_id: string) {
    return this.subscriptionsModel.findAndCountAll({
      where: { professor_id },
      attributes: ['student_id'],
      raw: true,
    }) as Promise<{ rows: { student_id: string }[]; count: number }>;
  }

  getSubscription(
    student_id: string,
    professor_id: string,
  ): Promise<SubscriptionsAttributes | null> {
    return this.subscriptionsModel.findOne({
      where: { student_id, professor_id },
      raw: true,
    });
  }

  unSubscribe(student_id: string, professor_id: string) {
    return this.subscriptionsModel.destroy({
      where: { student_id, professor_id },
    });
  }
}
