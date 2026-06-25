import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { Conversation } from '../../domain/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class FindConversationByIdQuery extends Query<Conversation | null> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(FindConversationByIdQuery)
export class FindConversationByIdHandler
  extends LoggedHandler<FindConversationByIdQuery, Conversation | null>
  implements IQueryHandler<FindConversationByIdQuery, Conversation | null>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected handle(query: FindConversationByIdQuery): Promise<Conversation | null> {
    return this.conversations.findByConversationId(query.id);
  }
}
