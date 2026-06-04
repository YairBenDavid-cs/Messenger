import type { ReactElement } from 'react';
import { useAuth } from '@/shared/auth/useAuth';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import type { Message } from '@/pages/MessengerPage/domain/message/types/message';
import type { MessagesStatus } from '@/pages/MessengerPage/domain/message/state/messagesReducer';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { MessageItem } from '../components/MessageItem/MessageItem';
import styles from './MessageContainer.module.css';

interface MessageContainerProps {
  status: MessagesStatus;
  messages: Message[];
  error: string | null;
}

export function MessageContainer({ status, messages, error }: MessageContainerProps): ReactElement {
  const { session } = useAuth();
  const currentUserId = session?.user.id ?? '';
  const scrollRef = useAutoScroll<HTMLDivElement>(messages);

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
    <div className={styles.container} ref={scrollRef}>
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
