import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MAX_MESSAGE_LIMIT, MIN_MESSAGE_LIMIT } from '../message-limits';

export class MessagesQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_MESSAGE_LIMIT)
  @Max(MAX_MESSAGE_LIMIT)
  limit?: number;
}
