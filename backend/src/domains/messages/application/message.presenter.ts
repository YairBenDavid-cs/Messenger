import type { Message } from '../domain/message.entity';
import type { MessageView } from '../dto/message-response.dto';

export const MessagePresenter = {
  toView(message: Message): MessageView {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
    };
  },
};
