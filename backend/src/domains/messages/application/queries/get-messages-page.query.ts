import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { MESSAGE_REPOSITORY, type MessageRepository } from '../../domain/message.repository';
import type { MessagesPage } from '../../dto/message-response.dto';
import { DEFAULT_MESSAGE_LIMIT } from '../../message-limits';
import { decodeCursor, encodeCursor } from '../message-cursor';
import { MessagePresenter } from '../message.presenter';

export class GetMessagesPageQuery extends Query<MessagesPage> {
  constructor(
    public readonly conversationId: string,
    public readonly cursor?: string,
    public readonly limit: number = DEFAULT_MESSAGE_LIMIT,
  ) {
    super();
  }
}

@QueryHandler(GetMessagesPageQuery)
export class GetMessagesPageHandler
  extends LoggedHandler<GetMessagesPageQuery, MessagesPage>
  implements IQueryHandler<GetMessagesPageQuery, MessagesPage>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messages: MessageRepository,
  ) {
    super();
  }

  protected async handle(query: GetMessagesPageQuery): Promise<MessagesPage> {
    const decoded = query.cursor !== undefined ? decodeCursor(query.cursor) : undefined;
    const rows = await this.messages.findPage(query.conversationId, decoded, query.limit + 1);

    const hasMore = rows.length > query.limit;
    const pageNewestFirst = hasMore ? rows.slice(0, query.limit) : rows;

    const oldest = pageNewestFirst[pageNewestFirst.length - 1];
    const nextCursor =
      hasMore && oldest !== undefined
        ? encodeCursor({ createdAt: oldest.createdAt, id: oldest.id })
        : null;

    const messages = [...pageNewestFirst]
      .reverse()
      .map((message) => MessagePresenter.toView(message));

    return { messages, nextCursor };
  }
}
