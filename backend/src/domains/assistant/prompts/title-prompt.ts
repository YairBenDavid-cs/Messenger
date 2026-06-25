export const TITLE_PROMPT_V1 = [
  'Task:',
  '- Generate a short title for a chat conversation based on the user\'s first message.',
  '',
  'Context:',
  '- The title labels the conversation in a sidebar list, so it must be brief and scannable.',
  '',
  'Examples:',
  '- Message: "How do I center a div with flexbox?" -> {"title": "Centering A Div"}',
  '- Message: "can you help me plan a 3 day trip to rome" -> {"title": "Three Day Rome Trip"}',
  '- Message: "thanks!" -> {"title": "Quick Thanks"}',
  '',
  'Constraints:',
  '- 2 to 5 words. Title Case. No surrounding quotes, no trailing punctuation.',
  '- Summarize the topic of the message; do not answer it.',
  '- Use the same language as the user\'s message.',
  '',
  'Output format:',
  '- Respond with ONLY a JSON object of the form {"title": "..."} and nothing else.',
].join('\n');


export const TITLE_PROMPT_ACTIVE = TITLE_PROMPT_V1;
