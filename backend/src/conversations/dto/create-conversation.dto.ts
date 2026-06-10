import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  participantIds!: string[];
}
