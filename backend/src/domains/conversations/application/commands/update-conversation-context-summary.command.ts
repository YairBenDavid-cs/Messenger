import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class UpdateConversationContextSummaryCommand extends Command<void> {
  constructor(
    public readonly conversationId: string,
    public readonly summary: string,
    public readonly summarizedUpTo: number,
  ) {
    super();
  }
}

@CommandHandler(UpdateConversationContextSummaryCommand)
export class UpdateConversationContextSummaryHandler
  extends LoggedHandler<UpdateConversationContextSummaryCommand, void>
  implements ICommandHandler<UpdateConversationContextSummaryCommand>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected handle(command: UpdateConversationContextSummaryCommand): Promise<void> {
    return this.conversations.updateContextSummary(
      command.conversationId,
      command.summary,
      command.summarizedUpTo,
    );
  }
}
