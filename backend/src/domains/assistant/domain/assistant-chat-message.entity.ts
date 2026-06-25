export type AssistantChatMessageRole = 'user' | 'assistant';

export type AssistantChatMessageFinishReason = 'stop' | 'stopped' | 'length' | 'tool' | 'error';

export interface AssistantChatMessageProps {
  id: string;
  conversationId: string;
  role: AssistantChatMessageRole;
  text: string;
  tokenCount?: number;
  finishReason?: AssistantChatMessageFinishReason;
  createdAt: Date;
}

export class AssistantChatMessage {
  readonly id: string;
  readonly conversationId: string;
  readonly role: AssistantChatMessageRole;
  readonly text: string;
  readonly tokenCount?: number;
  readonly finishReason?: AssistantChatMessageFinishReason;
  readonly createdAt: Date;

  constructor(props: AssistantChatMessageProps) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.role = props.role;
    this.text = props.text;
    this.tokenCount = props.tokenCount;
    this.finishReason = props.finishReason;
    this.createdAt = props.createdAt;
  }
}
