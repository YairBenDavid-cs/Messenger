import { Module } from '@nestjs/common';
import { GenerateAssistantTitleService } from './generate-title.service';

@Module({
  providers: [GenerateAssistantTitleService],
  exports: [GenerateAssistantTitleService],
})
export class GenerateAssistantTitleModule {}
