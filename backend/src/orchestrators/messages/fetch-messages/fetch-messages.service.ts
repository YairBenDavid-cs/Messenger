import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ListAssistantChatMessagesQuery } from '../../../domains/assistant/application/queries/list-assistant-chat-messages.query';
import type { AssistantChatMessageView } from '../../../domains/assistant/dto/assistant-chat-message.dto';
import { MarkConversationReadCommand } from '../../../domains/conversations/application/commands/mark-conversation-read.command';
import { FindConversationByIdQuery } from '../../../domains/conversations/application/queries/find-conversation-by-id.query';
import { GetMessagesPageQuery } from '../../../domains/messages/application/queries/get-messages-page.query';
import type { MessagesPage } from '../../../domains/messages/dto/message-response.dto';

@Injectable()
export class FetchMessagesService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async list(
    conversationId: string,
    viewerId: string,
    cursor?: string,
    limit?: number,
  ): Promise<MessagesPage | AssistantChatMessageView[]> {
    const conversation = await this.queryBus.execute(
      new FindConversationByIdQuery(conversationId),
    );
    if (conversation?.type === 'assistant') {
      return this.queryBus.execute(new ListAssistantChatMessagesQuery(conversationId));
    }
    await this.commandBus.execute(new MarkConversationReadCommand(conversationId, viewerId));
    return this.queryBus.execute(new GetMessagesPageQuery(conversationId, cursor, limit));
  }
}
