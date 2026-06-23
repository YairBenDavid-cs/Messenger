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
    const message = await this.tx.run(async (session) => {
      const created = await this.messages.createMessage(conversationId, senderId, text, session);
      await this.conversations.recordNewMessage(
        conversationId,
        senderId,
        text,
        created.createdAt,
        session,
      );
      return created;
    });

    return MessagePresenter.toView(message);
  }
}
