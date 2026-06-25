import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class MarkConversationReadCommand extends Command<void> {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
  ) {
    super();
  }
}

@CommandHandler(MarkConversationReadCommand)
export class MarkConversationReadHandler
  extends LoggedHandler<MarkConversationReadCommand, void>
  implements ICommandHandler<MarkConversationReadCommand>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected handle(command: MarkConversationReadCommand): Promise<void> {
    return this.conversations.resetUnread(command.conversationId, command.userId);
  }
}
