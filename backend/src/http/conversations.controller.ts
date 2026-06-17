import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../domains/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateConversationDto } from '../domains/conversations/dto/create-conversation.dto';
import type { ConversationView } from '../domains/conversations/dto/conversation-view.dto';
import { CreateConversationService } from '../orchestrators/conversations/create-conversation/create-conversation.service';
import { ListConversationsService } from '../orchestrators/conversations/list-conversations/list-conversations.service';
import type { PublicUser } from '../domains/users/dto/public-user.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    private readonly listConversations: ListConversationsService,
    private readonly createConversation: CreateConversationService,
  ) {}

  @Get()
  list(@CurrentUser() me: PublicUser): Promise<ConversationView[]> {
    return this.listConversations.listFor(me.id);
  }

  @Post()
  create(
    @CurrentUser() me: PublicUser,
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationView> {
    return this.createConversation.create(me.id, dto.participantIds);
  }
}
