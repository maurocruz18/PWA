import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  read: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Índice para otimizar a procura de mensagens numa conversa
MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', MessageSchema);