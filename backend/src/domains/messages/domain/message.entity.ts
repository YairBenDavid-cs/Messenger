export interface MessageProps {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

export class Message {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly text: string;
  readonly createdAt: Date;

  constructor(props: MessageProps) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.text = props.text;
    this.createdAt = props.createdAt;
  }
}

export interface Cursor {
  createdAt: Date;
  id: string;
}
