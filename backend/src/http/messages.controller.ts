import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../domains/auth/guards/jwt-auth.guard';
import { ParticipantGuard } from './guards/participant.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MessagesQueryDto } from '../domains/messages/dto/messages-query.dto';
import type { MessageView, MessagesPage } from '../domains/messages/dto/message-response.dto';
import { SendMessageDto } from '../domains/messages/dto/send-message.dto';
import type { AssistantChatMessageView } from '../domains/assistant/dto/assistant-chat-message.dto';
import { FetchMessagesService } from '../orchestrators/messages/fetch-messages/fetch-messages.service';
import { PostMessageService } from '../orchestrators/messages/post-message/post-message.service';
import type { PublicUser } from '../domains/users/dto/public-user.dto';

@Controller('conversations/:id/messages')
@UseGuards(JwtAuthGuard, ParticipantGuard)
export class MessagesController {
  constructor(
    private readonly fetchMessages: FetchMessagesService,
    private readonly postMessage: PostMessageService,
  ) {}

  @Get()
  list(
    @Param('id') conversationId: string,
    @Query() query: MessagesQueryDto,
    @CurrentUser() me: PublicUser,
  ): Promise<MessagesPage | AssistantChatMessageView[]> {
    return this.fetchMessages.list(conversationId, me.id, query.cursor, query.limit);
  }

  @Post()
  send(
    @Param('id') conversationId: string,
    @CurrentUser() me: PublicUser,
    @Body() dto: SendMessageDto,
  ): Promise<MessageView | AssistantChatMessageView> {
    return this.postMessage.post(conversationId, me.id, dto.text);
  }
}
