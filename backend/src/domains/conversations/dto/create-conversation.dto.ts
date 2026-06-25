import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';
import type { ConversationType } from '../domain/conversation.entity';

export class CreateConversationDto {
  @IsOptional()
  @IsIn(['direct', 'assistant'])
  type?: ConversationType;

  @ValidateIf((dto: CreateConversationDto) => dto.type !== 'assistant')
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  participantIds!: string[];
}
