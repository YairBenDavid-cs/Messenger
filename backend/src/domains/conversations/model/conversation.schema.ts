import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { ConversationType } from '../domain/conversation.entity';

@Schema({ collection: 'conversations', timestamps: true, discriminatorKey: 'type' })
export class ConversationModel {
  type!: ConversationType;

  @Prop({ type: [Types.ObjectId], ref: 'UserModel', required: true })
  participantIds!: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  lastMessageAt!: Date;

  @Prop({ default: '' })
  lastMessagePreview!: string;

  createdAt!: Date;
}

@Schema()
export class DirectConversationModel {
  @Prop({ required: true })
  participantKey!: string;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCounts!: Map<string, number>;
}

@Schema()
export class AssistantConversationModel {
  @Prop({ default: 'New chat' })
  title!: string;

  @Prop({ default: '' })
  contextSummary!: string;

  @Prop({ type: Number, default: 0 })
  summarizedUpTo!: number;
}

export type ConversationDocument = HydratedDocument<ConversationModel>;
export type DirectConversationDocument = HydratedDocument<
  ConversationModel & DirectConversationModel
>;
export type AssistantConversationDocument = HydratedDocument<
  ConversationModel & AssistantConversationModel
>;

export const ConversationSchema = SchemaFactory.createForClass(ConversationModel);
export const DirectConversationSchema = SchemaFactory.createForClass(DirectConversationModel);
export const AssistantConversationSchema = SchemaFactory.createForClass(AssistantConversationModel);

ConversationSchema.index({ type: 1, participantIds: 1, lastMessageAt: -1, _id: -1 });

DirectConversationSchema.index(
  { participantKey: 1 },
  { unique: true, partialFilterExpression: { type: 'direct' } },
);
