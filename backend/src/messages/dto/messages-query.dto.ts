import { IsOptional, IsString } from 'class-validator';

export class MessagesQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}
