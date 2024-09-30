import { Inject, Injectable } from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { TIME_SLOTS_MODEL, ITEMS_LIMIT } from 'src/constants';
import { TimeSlots } from 'src/database/models';

@Injectable()
export class TimeSlotsService {
  constructor(
    @Inject(TIME_SLOTS_MODEL)
    private readonly timeSlotsModel: typeof TimeSlots,
  ) {}

  async book(student_id: string, id: string) {
    let [, [row]] = await this.timeSlotsModel.update({student_id}, {where: {id}, returning: ['start_time', 'end_time']});
    return row as {start_time:Date; end_time: Date};
  }

  findAndCountAll({professor_id, page_number}: {professor_id: string; page_number: number}): Promise<{rows: TimeSlots[]; count:number}> {
    return this.timeSlotsModel.findAndCountAll(
      {
        where: {professor_id, student_id: {[Op.is]: Sequelize.literal('NULL')}}, 
        raw: true, 
        limit: ITEMS_LIMIT, 
        offset: page_number * ITEMS_LIMIT - ITEMS_LIMIT
      }
    )
  }

  createTimeSlot(professor_id: string, start_time: Date, end_time: Date) {
    return this.timeSlotsModel.create(
      { professor_id, start_time, end_time },
      { returning: true },
    );
  }
}
