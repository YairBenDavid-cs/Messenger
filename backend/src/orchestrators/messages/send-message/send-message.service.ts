import { Injectable } from '@nestjs/common';
import { TransactionRunner } from '../../../common/database/transaction-runner';
import { ConversationsService } from '../../../domains/conversations/application/conversations.service';
import { MessagesService } from '../../../domains/messages/application/messages.service';
import { MessagePresenter } from '../../../domains/messages/application/message.presenter';
import type { MessageView } from '../../../domains/messages/dto/message-response.dto';

@Injectable()
export class SendMessageService {
  constructor(
    private readonly messages: MessagesService,
    private readonly conversations: ConversationsService,
    private readonly tx: TransactionRunner,
  ) {}

  async send(conversationId: string, senderId: string, text: string): Promise<MessageView> {
    const message = await this.tx.run(async (uow) => {
      const created = await this.messages.createMessage(conversationId, senderId, text, uow);

      const conversation = await this.conversations.getById(conversationId, uow);
      await this.conversations.updateLastMessage(conversationId, text, created.createdAt, uow);
      if (conversation !== null) {
        const recipients = conversation.participantIds.filter((id) => id !== senderId);
        await this.conversations.incrementUnreadFor(conversationId, recipients, uow);
      }

      return created;
    });

    return MessagePresenter.toView(message);
  }
}
