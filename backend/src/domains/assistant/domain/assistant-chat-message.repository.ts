import type { AssistantChatMessage, AssistantChatMessageFinishReason, AssistantChatMessageRole } from './assistant-chat-message.entity';

export const ASSISTANT_CHAT_MESSAGE_REPOSITORY = Symbol('ASSISTANT_CHAT_MESSAGE_REPOSITORY');

export interface CreateAssistantChatMessageData {
  conversationId: string;
  role: AssistantChatMessageRole;
  text: string;
  tokenCount?: number;
  finishReason?: AssistantChatMessageFinishReason;
}

export interface AssistantChatMessageRepository {
  findByConversationId(conversationId: string): Promise<AssistantChatMessage[]>;

  findFirstByConversationId(conversationId: string): Promise<AssistantChatMessage | null>;

  countByConversationId(conversationId: string): Promise<number>;

  findById(id: string): Promise<AssistantChatMessage | null>;

  create(data: CreateAssistantChatMessageData): Promise<AssistantChatMessage>;
}
