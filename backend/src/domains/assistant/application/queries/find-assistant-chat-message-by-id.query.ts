import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { AssistantChatMessage } from '../../domain/assistant-chat-message.entity';
import { ASSISTANT_CHAT_MESSAGE_REPOSITORY, type AssistantChatMessageRepository } from '../../domain/assistant-chat-message.repository';

export class FindAssistantChatMessageByIdQuery extends Query<AssistantChatMessage | null> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(FindAssistantChatMessageByIdQuery)
export class FindAssistantChatMessageByIdHandler
  extends LoggedHandler<FindAssistantChatMessageByIdQuery, AssistantChatMessage | null>
  implements IQueryHandler<FindAssistantChatMessageByIdQuery, AssistantChatMessage | null>
{
  constructor(
    @Inject(ASSISTANT_CHAT_MESSAGE_REPOSITORY)
    private readonly turns: AssistantChatMessageRepository,
  ) {
    super();
  }

  protected handle(query: FindAssistantChatMessageByIdQuery): Promise<AssistantChatMessage | null> {
    return this.turns.findById(query.id);
  }
}
