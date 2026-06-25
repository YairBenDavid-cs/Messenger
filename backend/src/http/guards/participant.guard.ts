import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { FindConversationByIdQuery } from '../../domains/conversations/application/queries/find-conversation-by-id.query';
import type { PublicUser } from '../../domains/users/dto/public-user.dto';

@Injectable()
export class ParticipantGuard implements CanActivate {
  constructor(private readonly queryBus: QueryBus) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const conversationId = req.params.id;
    const user = req.user as PublicUser;

    const conversation = await this.queryBus.execute(
      new FindConversationByIdQuery(conversationId),
    );
    if (conversation === null) {
      throw new NotFoundException('Conversation not found');
    }
    if (!conversation.participantIds.includes(user.id)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }
    return true;
  }
}
