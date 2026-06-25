export const SUMMARY_PROMPT_V1 = [
  'Task:',
  '- Update a running summary of a conversation between a user and an assistant.',
  '',
  'Context:',
  '- You are given the previous summary (it may be empty) and the next batch of messages.',
  '- This summary is reused as background context on later turns, so it must stay compact.',
  '',
  'Constraints:',
  '- Preserve durable facts, names, decisions, and open action items / unresolved tasks; drop small talk and filler.',
  '- Write 4 to 10 short sentences, under 250 words. No preamble, no lists, no quotes.',
  '- Refer to the participants in the third person ("the user", "the assistant").',
  '',
  'Output format:',
  '- Respond with ONLY the updated summary text and nothing else.',
].join('\n');


export const SUMMARY_PROMPT_ACTIVE = SUMMARY_PROMPT_V1;
