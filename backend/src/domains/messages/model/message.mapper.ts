import { Message } from '../domain/message.entity';
import type { MessageDocument } from './message.schema';

export const MessageMapper = {
  toDomain(doc: MessageDocument): Message {
    return new Message({
      id: doc._id.toString(),
      conversationId: doc.conversationId.toString(),
      senderId: doc.senderId.toString(),
      text: doc.text,
      createdAt: doc.createdAt,
    });
  },
};
