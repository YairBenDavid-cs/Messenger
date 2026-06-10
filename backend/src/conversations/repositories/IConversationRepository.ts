export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCounts: Record<string, number>;
}

export interface IConversationRepository {
  findAllConversationsByUserId(userId: string): Promise<Conversation[]>;

  findConversationById(id: string): Promise<Conversation | null>;

  saveConversation(conversation: Conversation): Promise<Conversation>;

  findConversationByParticipants(userIdA: string, userIdB: string): Promise<Conversation | null>;

  updateConversationLastMessage(id: string, preview: string, at: string): Promise<void>;

  incrementConversationUnread(id: string, forUserId: string): Promise<void>;

  resetConversationUnread(id: string, forUserId: string): Promise<void>;
}
