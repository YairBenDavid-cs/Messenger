import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TransactionRunner } from '../../../common/database/transaction-runner';
import { AssistantChatMessagePresenter } from '../../../domains/assistant/application/assistant-chat-message.presenter';
import { AppendAssistantChatMessageCommand } from '../../../domains/assistant/application/commands/append-assistant-chat-message.command';
import type { AssistantChatMessageView } from '../../../domains/assistant/dto/assistant-chat-message.dto';
import { IncrementConversationUnreadCommand } from '../../../domains/conversations/application/commands/increment-conversation-unread.command';
import { UpdateConversationLastMessageCommand } from '../../../domains/conversations/application/commands/update-conversation-last-message.command';
import { FindConversationByIdQuery } from '../../../domains/conversations/application/queries/find-conversation-by-id.query';
import { CreateMessageCommand } from '../../../domains/messages/application/commands/create-message.command';
import { MessagePresenter } from '../../../domains/messages/application/message.presenter';
import type { MessageView } from '../../../domains/messages/dto/message-response.dto';

@Injectable()
export class PostMessageService {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async post(
    conversationId: string,
    senderId: string,
    text: string,
  ): Promise<MessageView | AssistantChatMessageView> {
    const conversation = await this.queryBus.execute(
      new FindConversationByIdQuery(conversationId),
    );
    if (conversation?.type === 'assistant') {
      const turn = await this.commandBus.execute(
        new AppendAssistantChatMessageCommand(conversationId, 'user', text),
      );
      return AssistantChatMessagePresenter.toView(turn);
    }
    return this.sendDirect(conversationId, senderId, text);
  }

  private async sendDirect(
    conversationId: string,
    senderId: string,
    text: string,
  ): Promise<MessageView> {
    const message = await this.tx.run(async () => {
      const created = await this.commandBus.execute(
        new CreateMessageCommand(conversationId, senderId, text),
      );

      const conversation = await this.queryBus.execute(
        new FindConversationByIdQuery(conversationId),
      );
      await this.commandBus.execute(
        new UpdateConversationLastMessageCommand(conversationId, text, created.createdAt),
      );
      if (conversation !== null) {
        const recipients = conversation.participantIds.filter((id) => id !== senderId);
        await this.commandBus.execute(
          new IncrementConversationUnreadCommand(conversationId, recipients),
        );
      }

      return created;
    });

    return MessagePresenter.toView(message);
  }
}
