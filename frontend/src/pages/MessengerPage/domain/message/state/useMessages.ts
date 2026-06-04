import { useCallback, useEffect, useReducer } from 'react';
import { ApiError } from '@/shared/api/ApiError';
import { useAuth } from '@/shared/auth/useAuth';
import { useConversations } from '@/pages/MessengerPage/domain/conversation/hooks/useConversations';
import { getMessages, sendMessage } from '../api/messages';
import { initialMessagesState, messagesReducer } from './messagesReducer';
import type { MessagesStatus } from './messagesReducer';
import type { Message } from '../types/message';

interface UseMessages {
  status: MessagesStatus;
  messages: Message[];
  error: string | null;
  send: (text: string) => void;
}

export function useMessages(conversationId: string): UseMessages {
  const [state, dispatch] = useReducer(messagesReducer, initialMessagesState);
  const { session } = useAuth();
  const { markReadLocally, applyMessagePreview } = useConversations();
  const currentUserId = session?.user.id ?? '';

  useEffect(() => {
    let active = true;
    dispatch({ type: 'load/start' });
    getMessages(conversationId).then(
      (page) => {
        if (!active) {
          return;
        }
        dispatch({ type: 'load/success', messages: page.messages });
        markReadLocally(conversationId);
      },
      (err: unknown) => {
        if (!active) {
          return;
        }
        dispatch({
          type: 'load/error',
          error: err instanceof ApiError ? err.message : 'Failed to load messages',
        });
      },
    );
    return () => {
      active = false;
    };
  }, [conversationId, markReadLocally]);

  const send = useCallback(
    (text: string): void => {
      const trimmed = text.trim();
      if (trimmed === '') {
        return;
      }
      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic: Message = {
        id: tempId,
        conversationId,
        senderId: currentUserId,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'send/optimistic', message: optimistic });
      sendMessage(conversationId, trimmed).then(
        (saved) => {
          dispatch({ type: 'send/success', tempId, message: saved });
          applyMessagePreview(conversationId, saved.text, saved.createdAt);
        },
        () => {
          dispatch({ type: 'send/error', tempId });
        },
      );
    },
    [conversationId, currentUserId, applyMessagePreview],
  );

  return { status: state.status, messages: state.messages, error: state.error, send };
}
