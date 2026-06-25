import { Inject, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { AssistantChatMessage, AssistantChatMessageFinishReason } from '../../domain/assistant-chat-message.entity';
import { buildContext } from '../../domain/context/build-context';
import { DEFAULT_CONTEXT_BUDGET } from '../../domain/context/context-budget';
import { estimateCost } from '../../domain/cost/cost-estimator';
import { estimateMessageTokens, estimateTokens } from '../../domain/context/token-estimate';
import {LLM_PROVIDER,type LlmFinishReason,type LlmMessage,type LlmProvider,type LlmToolCall,} from '../../domain/llm-provider';
import { ASSISTANT_CHAT_MESSAGE_REPOSITORY, type AssistantChatMessageRepository } from '../../domain/assistant-chat-message.repository';
import { PromptRepository } from '../../prompts/prompt.repository';
import { AssistantToolRegistry } from '../../tools/assistant-tool.registry';
import { doneEvent, errorEvent, tokenEvent, toolEvent } from '../sse-event';

const MAX_ITERATIONS = 3;

export class StreamAssistantReplyCommand extends Command<Observable<MessageEvent>> {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
    public readonly contextSummary: string = '',
    public readonly summarizedUpTo: number = 0,
  ) {
    super();
  }
}

@CommandHandler(StreamAssistantReplyCommand)
export class StreamAssistantReplyHandler
  extends LoggedHandler<StreamAssistantReplyCommand, Observable<MessageEvent>>
  implements ICommandHandler<StreamAssistantReplyCommand, Observable<MessageEvent>>
{
  private readonly errors = new Logger(StreamAssistantReplyHandler.name);
  private readonly metrics = new Logger(`${StreamAssistantReplyHandler.name}:cost`);
  private readonly replyModel: string;

  constructor(
    @Inject(ASSISTANT_CHAT_MESSAGE_REPOSITORY)
    private readonly turns: AssistantChatMessageRepository,
    private readonly prompts: PromptRepository,
    private readonly tools: AssistantToolRegistry,
    config: ConfigService,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
  ) {
    super();
    this.replyModel = config.get<string>('LLM_MODEL', 'gpt-4o');
  }

  protected async handle(command: StreamAssistantReplyCommand): Promise<Observable<MessageEvent>> {
    return from(this.generate(command));
  }

  private async *generate(command: StreamAssistantReplyCommand): AsyncGenerator<MessageEvent> {
    const { conversationId, userId, contextSummary, summarizedUpTo } = command;
    const startedAt = Date.now();
    let buffer = '';
    let llmFinish: LlmFinishReason = 'stop';
    let persisted = false;
    let errored = false;

    try {
      const history = await this.turns.findByConversationId(conversationId);
      const messages: LlmMessage[] = buildContext({
        summary: contextSummary,
        summarizedUpTo,
        turns: history,
        budget: DEFAULT_CONTEXT_BUDGET,
      });
      const system = this.prompts.getSystemPromptWithContext(contextSummary);
      const toolSpecs = this.tools.specs();

      for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const isLastPass = iteration === MAX_ITERATIONS - 1;
        const toolCalls: LlmToolCall[] = [];
        let roundText = '';

        for await (const event of this.llm.stream({
          system,
          messages,
          tools: isLastPass ? undefined : toolSpecs,
        })) {
          if (event.type === 'text-delta') {
            buffer += event.text;
            roundText += event.text;
            yield tokenEvent(event.text);
          } else if (event.type === 'tool-call') {
            toolCalls.push({ id: event.id, name: event.name, input: event.input });
          } else if (event.type === 'finish') {
            llmFinish = event.finishReason;
          }
        }

        if (toolCalls.length === 0) {
          break;
        }

        messages.push({ role: 'assistant', content: roundText, toolCalls });
        for (const call of toolCalls) {
          yield toolEvent(call.name, 'start');
          const result = await this.tools.run(call.name, call.input, userId);
          yield toolEvent(call.name, 'end');
          messages.push({ role: 'tool', toolCallId: call.id, content: result });
        }
      }

      const finishReason = toFinishReason(llmFinish);
      const turn = await this.persist(conversationId, buffer, finishReason);
      persisted = true;
      this.logCost(system, messages, buffer, Date.now() - startedAt);
      yield doneEvent(turn.id, finishReason);
    } catch (error) {
      errored = true;
      this.errors.warn(`assistant reply stream failed: ${reason(error)}`);
      yield errorEvent('ASSISTANT_STREAM_FAILED', 'The assistant could not complete the reply.');
    } finally {
      if (!persisted && !errored && buffer.length > 0) {
        try {
          await this.persist(conversationId, buffer, 'stopped');
        } catch (error) {
          this.errors.warn(`partial assistant turn persist failed: ${reason(error)}`);
        }
      }
    }
  }

  private persist(
    conversationId: string,
    text: string,
    finishReason: AssistantChatMessageFinishReason,
  ): Promise<AssistantChatMessage> {
    return this.turns.create({
      conversationId,
      role: 'assistant',
      text,
      finishReason,
    });
  }

  private logCost(
    system: string,
    messages: LlmMessage[],
    completion: string,
    latencyMs: number,
  ): void {
    const promptTokens = estimateTokens(system) + messages.reduce(promptTokensOf, 0);
    const completionTokens = estimateTokens(completion);
    const cost = estimateCost(this.replyModel, promptTokens, completionTokens);
    this.metrics.log(
      `model=${cost.model} promptTokens=${cost.promptTokens} ` +
        `completionTokens=${cost.completionTokens} totalTokens=${cost.totalTokens} ` +
        `usd=${cost.usd.toFixed(6)} latencyMs=${latencyMs}`,
    );
  }
}

function promptTokensOf(sum: number, message: LlmMessage): number {
  return sum + estimateMessageTokens(message.content);
}

function toFinishReason(finish: LlmFinishReason): AssistantChatMessageFinishReason {
  return finish;
}

function reason(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
