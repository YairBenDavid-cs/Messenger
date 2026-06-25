import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { AssistantChatMessage } from '../../domain/assistant-chat-message.entity';
import { ASSISTANT_CHAT_MESSAGE_REPOSITORY, type AssistantChatMessageRepository } from '../../domain/assistant-chat-message.repository';

export class FindFirstAssistantChatMessageQuery extends Query<AssistantChatMessage | null> {
  constructor(public readonly conversationId: string) {
    super();
  }
}

@QueryHandler(FindFirstAssistantChatMessageQuery)
export class FindFirstAssistantChatMessageHandler
  extends LoggedHandler<FindFirstAssistantChatMessageQuery, AssistantChatMessage | null>
  implements IQueryHandler<FindFirstAssistantChatMessageQuery, AssistantChatMessage | null>
{
  constructor(
    @Inject(ASSISTANT_CHAT_MESSAGE_REPOSITORY)
    private readonly turns: AssistantChatMessageRepository,
  ) {
    super();
  }

  protected handle(query: FindFirstAssistantChatMessageQuery): Promise<AssistantChatMessage | null> {
    return this.turns.findFirstByConversationId(query.conversationId);
  }
}
