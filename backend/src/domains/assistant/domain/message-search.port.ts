export const MESSAGE_SEARCH_PORT = Symbol('MESSAGE_SEARCH_PORT');

export interface MessageMatch {
  text: string;
  createdAt: string;
}

export interface MessageSearchPort {
  search(userId: string, query: string, limit: number): Promise<MessageMatch[]>;
}
