import { Inject, Injectable } from '@nestjs/common';
import type { UnitOfWork } from '../../../common/database/unit-of-work';
import { DEFAULT_MESSAGE_LIMIT } from '../message-limits';
import type { Message } from '../domain/message.entity';
import { MESSAGE_REPOSITORY, type MessageRepository } from '../domain/message.repository';
import type { MessagesPage } from '../dto/message-response.dto';
import { decodeCursor, encodeCursor } from './message-cursor';
import { MessagePresenter } from './message.presenter';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messages: MessageRepository,
  ) {}

  async getMessages(
    conversationId: string,
    cursor?: string,
    limit: number = DEFAULT_MESSAGE_LIMIT,
  ): Promise<MessagesPage> {
    const decoded = cursor !== undefined ? decodeCursor(cursor) : undefined;
    const rows = await this.messages.findPage(conversationId, decoded, limit + 1);

    const hasMore = rows.length > limit;
    const pageNewestFirst = hasMore ? rows.slice(0, limit) : rows;

    const oldest = pageNewestFirst[pageNewestFirst.length - 1];
    const nextCursor =
      hasMore && oldest !== undefined
        ? encodeCursor({ createdAt: oldest.createdAt, id: oldest.id })
        : null;

    const messages = [...pageNewestFirst]
      .reverse()
      .map((message) => MessagePresenter.toView(message));

    return { messages, nextCursor };
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    text: string,
    uow?: UnitOfWork,
  ): Promise<Message> {
    return this.messages.create({ conversationId, senderId, text }, uow);
  }
}
