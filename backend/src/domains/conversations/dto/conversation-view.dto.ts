export interface ConversationView {
  id: string;
  participants: string[];
  title: string;
  avatarUrl: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}
