import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AssistantConversationPresenter } from '../../../domains/conversations/application/assistant-conversation.presenter';
import { CreateAssistantConversationCommand } from '../../../domains/conversations/application/commands/create-assistant-conversation.command';
import { CreateConversationDto } from '../../../domains/conversations/dto/create-conversation.dto';
import type { ConversationView } from '../../../domains/conversations/dto/conversation-view.dto';
import { CreateDirectConversationService } from '../create-direct-conversation/create-direct-conversation.service';

@Injectable()
export class CreateConversationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly createDirect: CreateDirectConversationService,
  ) {}

  async create(viewerId: string, dto: CreateConversationDto): Promise<ConversationView> {
    if (dto.type === 'assistant') {
      const conversation = await this.commandBus.execute(
        new CreateAssistantConversationCommand(viewerId),
      );
      return AssistantConversationPresenter.toView(conversation);
    }
    return this.createDirect.create(viewerId, dto.participantIds);
  }
}
