import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { MESSAGE_REPOSITORY, type MessageRepository } from '../../domain/message.repository';

export interface MyMessageMatch {
  text: string;
  createdAt: string;
}

export class SearchMyMessagesQuery extends Query<MyMessageMatch[]> {
  constructor(
    public readonly senderId: string,
    public readonly query: string,
    public readonly limit: number,
  ) {
    super();
  }
}

@QueryHandler(SearchMyMessagesQuery)
export class SearchMyMessagesHandler
  extends LoggedHandler<SearchMyMessagesQuery, MyMessageMatch[]>
  implements IQueryHandler<SearchMyMessagesQuery, MyMessageMatch[]>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messages: MessageRepository,
  ) {
    super();
  }

  protected async handle(query: SearchMyMessagesQuery): Promise<MyMessageMatch[]> {
    const rows = await this.messages.searchBySender(query.senderId, query.query, query.limit);
    return rows.map((row) => ({ text: row.text, createdAt: row.createdAt.toISOString() }));
  }
}
