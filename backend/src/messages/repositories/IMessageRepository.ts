export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface MessagesPage {
  messages: Message[];
  nextCursor: string | null;
}

export interface IMessageRepository {
  findMessagesByConversation(
    conversationId: string,
    cursor?: string,
    limit?: number,
  ): Promise<MessagesPage>;

  saveMessage(message: Message): Promise<Message>;
}
