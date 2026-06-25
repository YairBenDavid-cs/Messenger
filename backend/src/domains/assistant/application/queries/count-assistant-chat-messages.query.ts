import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { ASSISTANT_CHAT_MESSAGE_REPOSITORY, type AssistantChatMessageRepository } from '../../domain/assistant-chat-message.repository';

export class CountAssistantChatMessagesQuery extends Query<number> {
  constructor(public readonly conversationId: string) {
    super();
  }
}

@QueryHandler(CountAssistantChatMessagesQuery)
export class CountAssistantChatMessagesHandler
  extends LoggedHandler<CountAssistantChatMessagesQuery, number>
  implements IQueryHandler<CountAssistantChatMessagesQuery, number>
{
  constructor(
    @Inject(ASSISTANT_CHAT_MESSAGE_REPOSITORY)
    private readonly turns: AssistantChatMessageRepository,
  ) {
    super();
  }

  protected handle(query: CountAssistantChatMessagesQuery): Promise<number> {
    return this.turns.countByConversationId(query.conversationId);
  }
}
