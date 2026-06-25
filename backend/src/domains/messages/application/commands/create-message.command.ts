import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { Message } from '../../domain/message.entity';
import { MESSAGE_REPOSITORY, type MessageRepository } from '../../domain/message.repository';

export class CreateMessageCommand extends Command<Message> {
  constructor(
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly text: string,
  ) {
    super();
  }
}

@CommandHandler(CreateMessageCommand)
export class CreateMessageHandler
  extends LoggedHandler<CreateMessageCommand, Message>
  implements ICommandHandler<CreateMessageCommand>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messages: MessageRepository,
  ) {
    super();
  }

  protected handle(command: CreateMessageCommand): Promise<Message> {
    return this.messages.create({
      conversationId: command.conversationId,
      senderId: command.senderId,
      text: command.text,
    });
  }
}
