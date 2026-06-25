import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { ASSISTANT_CHAT_MESSAGE_REPOSITORY, type AssistantChatMessageRepository } from '../../domain/assistant-chat-message.repository';
import { AssistantChatMessagePresenter } from '../assistant-chat-message.presenter';
import type { AssistantChatMessageView } from '../../dto/assistant-chat-message.dto';
export class ListAssistantChatMessagesQuery extends Query<AssistantChatMessageView[]> {
  constructor(public readonly conversationId: string) {
    super();
  }
}

@QueryHandler(ListAssistantChatMessagesQuery)
export class ListAssistantChatMessagesHandler
  extends LoggedHandler<ListAssistantChatMessagesQuery, AssistantChatMessageView[]>
  implements IQueryHandler<ListAssistantChatMessagesQuery, AssistantChatMessageView[]>
{
  constructor(
    @Inject(ASSISTANT_CHAT_MESSAGE_REPOSITORY)
    private readonly turns: AssistantChatMessageRepository,
  ) {
    super();
  }

  protected async handle(query: ListAssistantChatMessagesQuery): Promise<AssistantChatMessageView[]> {
    const turns = await this.turns.findByConversationId(query.conversationId);
    return turns.map((turn) => AssistantChatMessagePresenter.toView(turn));
  }
}
