import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../users/entities/user.entity';
import type { ConversationView } from './entities/conversation.entity';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  list(@CurrentUser() me: PublicUser): Promise<ConversationView[]> {
    return this.conversations.listConversations(me.id);
  }

  @Post()
  create(
    @CurrentUser() me: PublicUser,
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationView> {
    return this.conversations.createConversation(me.id, dto.participantIds);
  }
}
