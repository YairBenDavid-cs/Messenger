import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  SearchMyMessagesQuery,
  type MyMessageMatch,
} from '../../messages/application/queries/search-my-messages.query';
import type { MessageMatch, MessageSearchPort } from '../domain/message-search.port';

@Injectable()
export class QueryBusMessageSearchAdapter implements MessageSearchPort {
  constructor(private readonly queryBus: QueryBus) {}

  async search(userId: string, query: string, limit: number): Promise<MessageMatch[]> {
    return this.queryBus.execute<SearchMyMessagesQuery, MyMessageMatch[]>(
      new SearchMyMessagesQuery(userId, query, limit),
    );
  }
}
