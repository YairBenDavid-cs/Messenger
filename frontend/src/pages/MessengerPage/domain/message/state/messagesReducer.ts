import type { Message } from '../types/message';

export type MessagesStatus = 'loading' | 'ready' | 'error';

export interface MessagesState {
  status: MessagesStatus;
  messages: Message[];
  error: string | null;
  nextCursor: string | null;
  loadingOlder: boolean;
}

export type MessagesAction =
  | { type: 'load/start' }
  | { type: 'load/success'; messages: Message[]; nextCursor: string | null }
  | { type: 'load/error'; error: string }
  | { type: 'loadOlder/start' }
  | { type: 'loadOlder/success'; messages: Message[]; nextCursor: string | null }
  | { type: 'loadOlder/error' }
  | { type: 'send/optimistic'; message: Message }
  | { type: 'send/success'; tempId: string; message: Message }
  | { type: 'send/error'; tempId: string };

export const initialMessagesState: MessagesState = {
  status: 'loading',
  messages: [],
  error: null,
  nextCursor: null,
  loadingOlder: false,
};

export function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  switch (action.type) {
    case 'load/start':
      return { status: 'loading', messages: [], error: null, nextCursor: null, loadingOlder: false };
    case 'load/success':
      return {
        status: 'ready',
        messages: action.messages,
        error: null,
        nextCursor: action.nextCursor,
        loadingOlder: false,
      };
    case 'load/error':
      return {
        status: 'error',
        messages: [],
        error: action.error,
        nextCursor: null,
        loadingOlder: false,
      };
    case 'loadOlder/start':
      return { ...state, loadingOlder: true };
    case 'loadOlder/success':
      return {
        ...state,
        messages: [...action.messages, ...state.messages],
        nextCursor: action.nextCursor,
        loadingOlder: false,
      };
    case 'loadOlder/error':
      return { ...state, loadingOlder: false };
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
