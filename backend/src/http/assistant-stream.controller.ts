import { Controller, Param, Sse, UseGuards } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtStreamAuthGuard } from '../domains/auth/guards/jwt-stream-auth.guard';
import type { PublicUser } from '../domains/users/dto/public-user.dto';
import { StreamAssistantReplyService } from '../orchestrators/assistant/stream-reply/stream-reply.service';
import { AssistantRateLimitGuard } from './guards/assistant-rate-limit.guard';
import { ParticipantGuard } from './guards/participant.guard';


@Controller('conversations/:id/assistant')
@UseGuards(JwtStreamAuthGuard, ParticipantGuard, AssistantRateLimitGuard)
export class AssistantStreamController {
  constructor(private readonly streamReply: StreamAssistantReplyService) {}

  @Sse('stream')
  stream(
    @Param('id') conversationId: string,
    @CurrentUser() me: PublicUser,
  ): Observable<MessageEvent> {
    return this.streamReply.stream(conversationId, me.id);
  }
}
