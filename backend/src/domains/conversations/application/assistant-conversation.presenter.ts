import type { Conversation } from '../domain/conversation.entity';
import type { AssistantConversationView } from '../dto/conversation-view.dto';

export const AssistantConversationPresenter = {
  toView(conversation: Conversation): AssistantConversationView {
    return {
      id: conversation.id,
      type: 'assistant',
      title: conversation.title ?? 'New chat',
      lastMessageAt: conversation.lastMessageAt.toISOString(),
    };
  },
};
