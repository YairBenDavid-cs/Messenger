import { Module } from '@nestjs/common';
import { FetchMessagesService } from './fetch-messages.service';

@Module({
  providers: [FetchMessagesService],
  exports: [FetchMessagesService],
})
export class FetchMessagesModule {}
