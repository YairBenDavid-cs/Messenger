import type { MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Observable } from 'rxjs';
import { AssistantChatMessage } from '../../domain/assistant-chat-message.entity';
import {
  ASSISTANT_CHAT_MESSAGE_REPOSITORY,
  type CreateAssistantChatMessageData,
} from '../../domain/assistant-chat-message.repository';
import {
  LLM_PROVIDER,
  type LlmCompletionRequest,
  type LlmProvider,
  type LlmStreamEvent,
} from '../../domain/llm-provider';
import { PromptRepository } from '../../prompts/prompt.repository';
import { AssistantToolRegistry } from '../../tools/assistant-tool.registry';
import { StreamAssistantReplyCommand, StreamAssistantReplyHandler } from './stream-assistant-reply.command';

// A provider that replays a scripted list of stream events per call. Each call to
// stream() consumes the next script, so a multi-pass tool loop can be modelled as
// [pass-1 events, pass-2 events, ...]. An optional delay between yields creates an
// async boundary so a subscriber can unsubscribe mid-stream (the abort case).
class ScriptedLlm implements LlmProvider {
  private call = 0;

  constructor(
    private readonly scripts: LlmStreamEvent[][],
    private readonly delayMs = 0,
  ) {}

  stream(_request: LlmCompletionRequest): AsyncIterable<LlmStreamEvent> {
    const events = this.scripts[this.call] ?? [];
    this.call += 1;
    const delayMs = this.delayMs;
    return (async function* () {
      for (const event of events) {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        yield event;
      }
    })();
  }

  generateText(_request: LlmCompletionRequest): Promise<string> {
    return Promise.resolve('');
  }
}

const TURN_STUB = new AssistantChatMessage({
  id: 'turn-1',
  conversationId: 'conv-1',
  role: 'assistant',
  text: '',
  createdAt: new Date(0),
});

interface Harness {
  obs: Observable<MessageEvent>;
  persist: jest.Mock<Promise<AssistantChatMessage>, [CreateAssistantChatMessageData]>;
  toolRun: jest.Mock<Promise<string>, [string, unknown, string]>;
}

async function harness(llm: ScriptedLlm): Promise<Harness> {
  const persist = jest
    .fn<Promise<AssistantChatMessage>, [CreateAssistantChatMessageData]>()
    .mockResolvedValue(TURN_STUB);
  const toolRun = jest
    .fn<Promise<string>, [string, unknown, string]>()
    .mockResolvedValue('{"matches":[]}');

  const moduleRef = await Test.createTestingModule({
    providers: [
      StreamAssistantReplyHandler,
      {
        provide: ASSISTANT_CHAT_MESSAGE_REPOSITORY,
        useValue: { findByConversationId: () => Promise.resolve([]), create: persist },
      },
      {
        provide: PromptRepository,
        useValue: { getSystemPromptWithContext: () => 'SYSTEM' },
      },
      {
        provide: AssistantToolRegistry,
        useValue: {
          specs: () => [
            { name: 'search_my_messages', description: 'search', parameters: { type: 'object' } },
          ],
          run: toolRun,
        },
      },
      { provide: ConfigService, useValue: { get: () => 'gpt-4o' } },
      { provide: LLM_PROVIDER, useValue: llm },
    ],
  }).compile();

  const handler = moduleRef.get(StreamAssistantReplyHandler);
  const obs = await handler.execute(new StreamAssistantReplyCommand('conv-1', 'user-1'));
  return { obs, persist, toolRun };
}

function collect(obs: Observable<MessageEvent>): Promise<MessageEvent[]> {
  return new Promise((resolve, reject) => {
    const out: MessageEvent[] = [];
    obs.subscribe({ next: (event) => out.push(event), error: reject, complete: () => resolve(out) });
  });
}

describe('StreamAssistantReplyHandler', () => {
  it('streams tokens, persists the reply, and emits a done event', async () => {
    const { obs, persist } = await harness(
      new ScriptedLlm([
        [
          { type: 'text-delta', text: 'Hello' },
          { type: 'text-delta', text: ' world' },
          { type: 'finish', finishReason: 'stop' },
        ],
      ]),
    );

    const events = await collect(obs);

    expect(events.filter((e) => e.type === 'token').map((e) => e.data)).toEqual([
      { delta: 'Hello' },
      { delta: ' world' },
    ]);
    expect(events[events.length - 1]).toEqual({
      type: 'done',
      data: { messageId: 'turn-1', finishReason: 'stop' },
    });
    expect(persist).toHaveBeenCalledTimes(1);
    const data = persist.mock.calls[0][0];
    expect(data.role).toBe('assistant');
    expect(data.text).toBe('Hello world');
    expect(data.finishReason).toBe('stop');
  });

  it('runs a tool call, feeds the result back, and finishes in text', async () => {
    const { obs, persist, toolRun } = await harness(
      new ScriptedLlm([
        [
          { type: 'tool-call', id: 'call-1', name: 'search_my_messages', input: { query: 'budget' } },
          { type: 'finish', finishReason: 'tool' },
        ],
        [
          { type: 'text-delta', text: 'You mentioned the budget.' },
          { type: 'finish', finishReason: 'stop' },
        ],
      ]),
    );

    const events = await collect(obs);

    expect(toolRun).toHaveBeenCalledWith('search_my_messages', { query: 'budget' }, 'user-1');
    expect(events.filter((e) => e.type === 'tool').map((e) => e.data)).toEqual([
      { name: 'search_my_messages', phase: 'start' },
      { name: 'search_my_messages', phase: 'end' },
    ]);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist.mock.calls[0][0].text).toBe('You mentioned the budget.');
  });

  it('emits an error event and persists nothing when the provider throws', async () => {
    const failing = new ScriptedLlm([]);
    jest.spyOn(failing, 'stream').mockImplementation(() => {
      throw new Error('provider exploded');
    });
    const { obs, persist } = await harness(failing);

    const events = await collect(obs);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('error');
    expect(events[0].data).toEqual({
      code: 'ASSISTANT_STREAM_FAILED',
      message: 'The assistant could not complete the reply.',
    });
    expect(persist).not.toHaveBeenCalled();
  });

  it('persists the partial reply with finishReason "stopped" when the client disconnects mid-stream', async () => {
    const { obs, persist } = await harness(
      new ScriptedLlm(
        [
          [
            { type: 'text-delta', text: 'partial' },
            { type: 'text-delta', text: ' answer' },
            { type: 'finish', finishReason: 'stop' },
          ],
        ],
        5,
      ),
    );

    await new Promise<void>((resolve) => {
      const sub = obs.subscribe({
        next: (event) => {
          if (event.type === 'token') {
            sub.unsubscribe();
            resolve();
          }
        },
        complete: () => resolve(),
        error: () => resolve(),
      });
    });
    // Let the generator's finally block run its best-effort persist.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(persist).toHaveBeenCalledTimes(1);
    const data = persist.mock.calls[0][0];
    expect(data.finishReason).toBe('stopped');
    expect(data.text).toBe('partial');
  });
});
