import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'conversations', timestamps: true })
export class ConversationModel {
  @Prop({ type: [Types.ObjectId], ref: 'UserModel', required: true })
  participantIds!: Types.ObjectId[];

  @Prop({ required: true })
  participantKey!: string;

  @Prop({ type: Date, default: Date.now })
  lastMessageAt!: Date;

  @Prop({ default: '' })
  lastMessagePreview!: string;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCounts!: Map<string, number>;

  createdAt!: Date;
}

export type ConversationDocument = HydratedDocument<ConversationModel>;

export const ConversationSchema = SchemaFactory.createForClass(ConversationModel);

ConversationSchema.index({ participantIds: 1, lastMessageAt: -1 });
ConversationSchema.index({ participantKey: 1 }, { unique: true });
