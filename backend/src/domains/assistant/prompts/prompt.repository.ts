import { Injectable } from '@nestjs/common';
import { interpolate } from './interpolate';
import {
  SYSTEM_PROMPT_ACTIVE,
  SYSTEM_SUMMARY_PREFACE_ACTIVE,
} from './system-prompt';
import { SUMMARY_PROMPT_ACTIVE } from './summary-prompt';
import { TITLE_PROMPT_ACTIVE } from './title-prompt';

@Injectable()
export class PromptRepository {
  getSystemPrompt(vars: Record<string, string> = {}): string {
    return interpolate(SYSTEM_PROMPT_ACTIVE, vars);
  }

  getSystemPromptWithContext(summary: string): string {
    const base = this.getSystemPrompt();
    if (summary.trim() === '') {
      return base;
    }
    return base + interpolate(SYSTEM_SUMMARY_PREFACE_ACTIVE, { summary });
  }

  getTitlePrompt(vars: Record<string, string> = {}): string {
    return interpolate(TITLE_PROMPT_ACTIVE, vars);
  }

  getSummaryPrompt(vars: Record<string, string> = {}): string {
    return interpolate(SUMMARY_PROMPT_ACTIVE, vars);
  }
}
