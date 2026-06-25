import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { Conversation } from '../../domain/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class CreateAssistantConversationCommand extends Command<Conversation> {
  constructor(public readonly ownerId: string) {
    super();
  }
}

@CommandHandler(CreateAssistantConversationCommand)
export class CreateAssistantConversationHandler
  extends LoggedHandler<CreateAssistantConversationCommand, Conversation>
  implements ICommandHandler<CreateAssistantConversationCommand>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected handle(command: CreateAssistantConversationCommand): Promise<Conversation> {
    return this.conversations.createAssistant(command.ownerId);
  }
}
