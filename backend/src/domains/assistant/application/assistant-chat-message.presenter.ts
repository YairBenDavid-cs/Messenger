import type { AssistantChatMessage } from '../domain/assistant-chat-message.entity';
import type { AssistantChatMessageView } from '../dto/assistant-chat-message.dto';

export const AssistantChatMessagePresenter = {
  toView(turn: AssistantChatMessage): AssistantChatMessageView {
    return {
      id: turn.id,
      conversationId: turn.conversationId,
      role: turn.role,
      text: turn.text,
      createdAt: turn.createdAt.toISOString(),
    };
  },
};
