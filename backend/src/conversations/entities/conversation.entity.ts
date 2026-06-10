export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCounts: Record<string, number>;
}

export interface ConversationView {
  id: string;
  participants: string[];
  title: string;
  avatarUrl: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}
