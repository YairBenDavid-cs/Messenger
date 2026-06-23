import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_MESSAGE_TEXT_LENGTH } from '../message-limits';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_MESSAGE_TEXT_LENGTH)
  text!: string;
}
