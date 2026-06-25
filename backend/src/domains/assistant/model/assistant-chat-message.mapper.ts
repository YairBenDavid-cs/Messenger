import { AssistantChatMessage } from '../domain/assistant-chat-message.entity';
import type { AssistantChatMessageDocument } from './assistant-chat-message.schema';

export const AssistantChatMessageMapper = {
  toDomain(doc: AssistantChatMessageDocument): AssistantChatMessage {
    return new AssistantChatMessage({
      id: doc._id.toString(),
      conversationId: doc.conversationId.toString(),
      role: doc.role,
      text: doc.text,
      tokenCount: doc.tokenCount,
      finishReason: doc.finishReason,
      createdAt: doc.createdAt,
    });
  },
};
