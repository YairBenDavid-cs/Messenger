import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { Conversation, ConversationType } from '../../domain/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class FindConversationsForUserQuery extends Query<Conversation[]> {
  constructor(
    public readonly viewerId: string,
    public readonly type?: ConversationType,
  ) {
    super();
  }
}

@QueryHandler(FindConversationsForUserQuery)
export class FindConversationsForUserHandler
  extends LoggedHandler<FindConversationsForUserQuery, Conversation[]>
  implements IQueryHandler<FindConversationsForUserQuery, Conversation[]>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected handle(query: FindConversationsForUserQuery): Promise<Conversation[]> {
    return this.conversations.findConversationsByUserId(query.viewerId, query.type);
  }
}
