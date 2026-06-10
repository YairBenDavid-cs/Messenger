import { useCallback, useEffect, useReducer } from 'react';
import { ApiError } from '@/shared/api/ApiError';
import { useAuth } from '@/shared/auth/useAuth';
import { useConversations } from '@/pages/MessengerPage/domain/conversation/hooks/useConversations';
import { createConversation } from '@/pages/MessengerPage/domain/conversation/api/conversations';
import { isDraftId } from '@/pages/MessengerPage/domain/conversation/types/conversation';
import { getMessages, sendMessage } from '../api/messages';
import { initialMessagesState, messagesReducer } from './messagesReducer';
import type { MessagesStatus } from './messagesReducer';
import type { Message } from '../types/message';

interface UseMessages {
  status: MessagesStatus;
  messages: Message[];
  error: string | null;
  hasMore: boolean;
  loadingOlder: boolean;
  loadOlder: () => void;
  send: (text: string) => void;
}

export function useMessages(conversationId: string): UseMessages {
  const [state, dispatch] = useReducer(messagesReducer, initialMessagesState);
  const { session } = useAuth();
  const {
    conversations,
    markReadLocally,
    applyMessagePreview,
    draft,
    addConversation,
    select,
    clearDraft,
  } = useConversations();
  const currentUserId = session?.user.id ?? '';
  const isDraft = isDraftId(conversationId);

  useEffect(() => {
    // A draft has no persisted conversation yet, so there is nothing to fetch:
    // start with an empty, ready thread the user can type into.
    if (isDraft) {
      dispatch({ type: 'load/success', messages: [], nextCursor: null });
      return;
    }
    let active = true;
    dispatch({ type: 'load/start' });
    getMessages(conversationId).then(
      (page) => {
        if (!active) {
          return;
        }
        dispatch({ type: 'load/success', messages: page.messages, nextCursor: page.nextCursor });
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
  }, [conversationId, markReadLocally, isDraft]);

  const loadOlder = useCallback((): void => {
    if (state.loadingOlder || state.nextCursor === null) {
      return;
    }
    const cursor = state.nextCursor;
    dispatch({ type: 'loadOlder/start' });
    getMessages(conversationId, cursor).then(
      (page) => {
        dispatch({
          type: 'loadOlder/success',
          messages: page.messages,
          nextCursor: page.nextCursor,
        });
      },
      () => {
        dispatch({ type: 'loadOlder/error' });
      },
    );
  }, [conversationId, state.loadingOlder, state.nextCursor]);

  // Sending the first message of a draft lazily creates the real conversation,
  // adds it to the sidebar, persists the message, then switches the selection to
  // the real conversation (which reloads its thread from the server).
  const sendFromDraft = useCallback(
    (tempId: string, otherUserId: string, text: string): void => {
      const persistInto = (conversationIdToUse: string): void => {
        sendMessage(conversationIdToUse, text).then(
          (saved) => {
            applyMessagePreview(conversationIdToUse, saved.text, saved.createdAt);
            clearDraft();
            select(conversationIdToUse);
          },
          () => {
            dispatch({ type: 'send/error', tempId });
          },
        );
      };

      createConversation(otherUserId).then(
        (conversation) => {
          addConversation(conversation);
          persistInto(conversation.id);
        },
        (err: unknown) => {
          // A conversation with this user already exists: reuse it instead.
          if (err instanceof ApiError && err.status === 409) {
            const existing = conversations.find((conversation) =>
              conversation.participants.includes(otherUserId),
            );
            if (existing !== undefined) {
              persistInto(existing.id);
              return;
            }
          }
          dispatch({ type: 'send/error', tempId });
        },
      );
    },
    [addConversation, applyMessagePreview, clearDraft, select, conversations],
  );

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

      if (isDraft && draft !== null) {
        sendFromDraft(tempId, draft.otherUserId, trimmed);
        return;
      }

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
    [conversationId, currentUserId, applyMessagePreview, isDraft, draft, sendFromDraft],
  );

  return {
    status: state.status,
    messages: state.messages,
    error: state.error,
    hasMore: state.nextCursor !== null,
    loadingOlder: state.loadingOlder,
    loadOlder,
    send,
  };
}
