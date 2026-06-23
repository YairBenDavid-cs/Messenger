export interface MessageView {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface MessagesPage {
  messages: MessageView[];
  nextCursor: string | null;
}
