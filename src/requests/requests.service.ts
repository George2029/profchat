import { Inject, Injectable } from '@nestjs/common';
import { REQUESTS_MODEL, ITEMS_LIMIT } from 'src/constants';
import { Requests } from 'src/database/models';

@Injectable()
export class RequestsService {
  constructor(
    @Inject(REQUESTS_MODEL)
    private readonly requestsModel: typeof Requests,
  ) {}

  async getRequest(id: string): Promise<RequestsAttributes | null> {
    return this.requestsModel.findByPk(id);
  }

  async update(id: string, options: {[key in keyof RequestsAttributes]?: RequestsAttributes[key]}) {
    await this.requestsModel.update(options, {where: {id}});
  }

  async createRequest(
    student_id: string,
    professor_id: string,
    student_comment: string,
  ) {
    await this.requestsModel.create({
      student_id,
      professor_id,
      student_comment,
    }, {returning: false});
  }

  getRequests(
    where: Record<string, string>,
    page_number: number,
  ): Promise<{ rows: Requests[]; count: number }> {
    return this.requestsModel.findAndCountAll({
      where,
      attributes: ['id', 'student_comment'],
      raw: true,
      limit: ITEMS_LIMIT,
      offset: ITEMS_LIMIT * (page_number - 1),
    });
  }
}
