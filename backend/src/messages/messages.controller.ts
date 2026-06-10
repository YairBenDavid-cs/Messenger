import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParticipantGuard } from '../auth/guards/participant.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';
import type { Message, MessagesPage } from './entities/message.entity';
import { MessagesService } from './messages.service';

@Controller('conversations/:id/messages')
@UseGuards(JwtAuthGuard, ParticipantGuard)
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(
    @Param('id') conversationId: string,
    @Query() query: MessagesQueryDto,
    @CurrentUser() me: PublicUser,
  ): Promise<MessagesPage> {
    return this.messages.getMessages(conversationId, me.id, query.cursor);
  }

  @Post()
  send(
    @Param('id') conversationId: string,
    @CurrentUser() me: PublicUser,
    @Body() dto: SendMessageDto,
  ): Promise<Message> {
    return this.messages.sendMessage(conversationId, me.id, dto.text);
  }
}
