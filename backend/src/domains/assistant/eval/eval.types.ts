import { z } from 'zod';

export interface AssistantOutcome {
  text: string;
  toolsInvoked: string[];
}

export const checksSchema = z
  .object({
    containsAll: z.array(z.string().min(1)).optional(),
    containsAny: z.array(z.string().min(1)).optional(),
    notContains: z.array(z.string().min(1)).optional(),
    regex: z.string().min(1).optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
    toolsInvoked: z.array(z.string().min(1)).optional(),
    noTools: z.boolean().optional(),
  })
  .strict();
export type Checks = z.infer<typeof checksSchema>;

export const evalCaseSchema = z
  .object({
    id: z.string().min(1),
    description: z.string().optional(),
    input: z.string().min(1),
    checks: checksSchema,
  })
  .strict();

export type EvalCase = z.infer<typeof evalCaseSchema>;

export const evalSuiteSchema = z.array(evalCaseSchema).min(1);

export interface CheckResult {
  label: string;
  passed: boolean;
}

export interface CaseScore {
  score: number;
  results: CheckResult[];
}
