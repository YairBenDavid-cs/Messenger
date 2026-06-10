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
