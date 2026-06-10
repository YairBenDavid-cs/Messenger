import type { ReactElement } from 'react';
import { useAuth } from '@/shared/auth/useAuth';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import type { Message } from '@/pages/MessengerPage/domain/message/types/message';
import type { MessagesStatus } from '@/pages/MessengerPage/domain/message/state/messagesReducer';
import { useChatScroll } from '../hooks/useChatScroll';
import { MessageItem } from '../components/MessageItem/MessageItem';
import styles from './MessageContainer.module.css';

interface MessageContainerProps {
  status: MessagesStatus;
  messages: Message[];
  error: string | null;
  hasMore: boolean;
  loadingOlder: boolean;
  loadOlder: () => void;
}

export function MessageContainer({
  status,
  messages,
  error,
  hasMore,
  loadingOlder,
  loadOlder,
}: MessageContainerProps): ReactElement {
  const { session } = useAuth();
  const currentUserId = session?.user.id ?? '';
  const { ref, onScroll } = useChatScroll({
    messages,
    hasMore,
    loadingOlder,
    onLoadOlder: loadOlder,
  });

  if (status === 'loading') {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }
  if (status === 'error') {
    return <div className={styles.center}>{error ?? 'Could not load messages.'}</div>;
  }

  return (
    <div className={styles.container} ref={ref} onScroll={onScroll}>
      {messages.length === 0 ? (
        <p className={styles.empty}>No messages yet. Say hello!</p>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            mine={message.senderId === currentUserId}
          />
        ))
      )}
    </div>
  );
}
