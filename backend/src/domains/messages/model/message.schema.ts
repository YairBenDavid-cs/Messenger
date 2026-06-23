import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'messages', timestamps: true })
export class MessageModel {
  @Prop({ type: Types.ObjectId, ref: 'ConversationModel', required: true })
  conversationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserModel', required: true })
  senderId!: Types.ObjectId;

  @Prop({ required: true, maxlength: 4000 })
  text!: string;

  createdAt!: Date;
}

export type MessageDocument = HydratedDocument<MessageModel>;

export const MessageSchema = SchemaFactory.createForClass(MessageModel);

MessageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });
