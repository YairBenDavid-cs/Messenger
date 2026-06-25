import { Module } from '@nestjs/common';
import { ResolveAssistantContextService } from './resolve-context.service';

@Module({
  providers: [ResolveAssistantContextService],
  exports: [ResolveAssistantContextService],
})
export class ResolveAssistantContextModule {}
