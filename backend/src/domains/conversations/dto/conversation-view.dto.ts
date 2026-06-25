interface BaseConversationView {
  id: string;
  lastMessageAt: string;
}

export interface DirectConversationView extends BaseConversationView {
  type: 'direct';
  participants: string[];
  title: string;
  avatarUrl: string;
  lastMessagePreview: string;
  unreadCount: number;
}

export interface AssistantConversationView extends BaseConversationView {
  type: 'assistant';
  title: string;
}

export type ConversationView = DirectConversationView | AssistantConversationView;
