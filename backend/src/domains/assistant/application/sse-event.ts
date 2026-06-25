import type { MessageEvent } from '@nestjs/common';
import { z } from 'zod';
import type { AssistantChatMessageFinishReason } from '../domain/assistant-chat-message.entity';


const FINISH_REASONS = ['stop', 'stopped', 'length', 'tool', 'error'] as const satisfies readonly AssistantChatMessageFinishReason[];

export const tokenEventSchema = z.object({ delta: z.string() });
export const doneEventSchema = z.object({
  messageId: z.string(),
  finishReason: z.enum(FINISH_REASONS),
});
export const errorEventSchema = z.object({ code: z.string(), message: z.string() });
export const toolEventSchema = z.object({
  name: z.string(),
  phase: z.enum(['start', 'end']),
});
export const titleEventSchema = z.object({ title: z.string() });

export type TokenEventData = z.infer<typeof tokenEventSchema>;
export type DoneEventData = z.infer<typeof doneEventSchema>;
export type ErrorEventData = z.infer<typeof errorEventSchema>;
export type ToolEventData = z.infer<typeof toolEventSchema>;
export type TitleEventData = z.infer<typeof titleEventSchema>;

export function tokenEvent(delta: string): MessageEvent {
  return { type: 'token', data: tokenEventSchema.parse({ delta }) };
}

export function titleEvent(title: string): MessageEvent {
  return { type: 'title', data: titleEventSchema.parse({ title }) };
}

export function toolEvent(name: string, phase: ToolEventData['phase']): MessageEvent {
  return { type: 'tool', data: toolEventSchema.parse({ name, phase }) };
}

export function doneEvent(messageId: string, finishReason: AssistantChatMessageFinishReason): MessageEvent {
  return { type: 'done', data: doneEventSchema.parse({ messageId, finishReason }) };
}

export function errorEvent(code: string, message: string): MessageEvent {
  return { type: 'error', data: errorEventSchema.parse({ code, message }) };
}
