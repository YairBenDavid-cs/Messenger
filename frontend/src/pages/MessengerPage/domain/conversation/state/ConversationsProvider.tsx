import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { ApiError } from '@/shared/api/ApiError';
import type { Conversation } from '../types/conversation';
import { listConversations } from '../api/conversations';
import { ConversationsContext } from './ConversationsContext';
import type { ConversationsContextValue, ConversationsStatus } from './ConversationsContext';

export function ConversationsProvider({ children }: { children: ReactNode }): ReactElement {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [status, setStatus] = useState<ConversationsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    listConversations().then(
      (list) => {
        if (!active) {
          return;
        }
        setConversations(list);
        setStatus('ready');
      },
      (err: unknown) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load conversations');
        setStatus('error');
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const select = useCallback((id: string): void => {
    setSelectedId(id);
  }, []);

  const clearSelection = useCallback((): void => {
    setSelectedId(null);
  }, []);

  const value = useMemo<ConversationsContextValue>(
    () => ({ conversations, status, error, selectedId, select, clearSelection }),
    [conversations, status, error, selectedId, select, clearSelection],
  );

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}
