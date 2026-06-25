import { Module } from '@nestjs/common';
import { GenerateAssistantTitleModule } from '../generate-title/generate-title.module';
import { ResolveAssistantContextModule } from '../resolve-context/resolve-context.module';
import { StreamAssistantReplyService } from './stream-reply.service';

@Module({
  imports: [ResolveAssistantContextModule, GenerateAssistantTitleModule],
  providers: [StreamAssistantReplyService],
  exports: [StreamAssistantReplyService],
})
export class StreamAssistantReplyModule {}
