import type { Message } from '../types/message';

export type MessagesStatus = 'loading' | 'ready' | 'error';

export interface MessagesState {
  status: MessagesStatus;
  messages: Message[];
  error: string | null;
}

export type MessagesAction =
  | { type: 'load/start' }
  | { type: 'load/success'; messages: Message[] }
  | { type: 'load/error'; error: string }
  | { type: 'send/optimistic'; message: Message }
  | { type: 'send/success'; tempId: string; message: Message }
  | { type: 'send/error'; tempId: string };

export const initialMessagesState: MessagesState = {
  status: 'loading',
  messages: [],
  error: null,
};

export function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  switch (action.type) {
    case 'load/start':
      return { status: 'loading', messages: [], error: null };
    case 'load/success':
      return { status: 'ready', messages: action.messages, error: null };
    case 'load/error':
      return { status: 'error', messages: [], error: action.error };
    case 'send/optimistic':
      return { ...state, messages: [...state.messages, action.message] };
    case 'send/success':
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.tempId ? action.message : message,
        ),
      };
    case 'send/error':
      return {
        ...state,
        messages: state.messages.filter((message) => message.id !== action.tempId),
      };
    default:
      return state;
  }
}
