import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { AssistantChatMessageFinishReason, AssistantChatMessageRole } from '../domain/assistant-chat-message.entity';

@Schema({ collection: 'assistantMessages', timestamps: true })
export class AssistantChatMessageModel {
  @Prop({ type: Types.ObjectId, ref: 'ConversationModel', required: true })
  conversationId!: Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'assistant'] })
  role!: AssistantChatMessageRole;

  @Prop({ default: '' })
  text!: string;

  @Prop({ type: Number })
  tokenCount?: number;

  @Prop({ type: String, enum: ['stop', 'stopped', 'length', 'tool', 'error'] })
  finishReason?: AssistantChatMessageFinishReason;

  createdAt!: Date;
}

export type AssistantChatMessageDocument = HydratedDocument<AssistantChatMessageModel>;

export const AssistantChatMessageSchema = SchemaFactory.createForClass(AssistantChatMessageModel);

AssistantChatMessageSchema.index({ conversationId: 1, createdAt: 1, _id: 1 });
