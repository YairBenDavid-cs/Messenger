import type { ReactElement } from 'react';
import { useMessages } from '@/pages/MessengerPage/domain/message/state/useMessages';
import { useDeselectOnEscape } from '../hooks/useDeselectOnEscape';
import { MessageContainer } from '../components/MessageContainer/view/MessageContainer';
import { ChatBar } from '../components/ChatBar/view/ChatBar';
import styles from './ActiveChat.module.css';

interface ActiveChatProps {
  conversationId: string;
}

export function ActiveChat({ conversationId }: ActiveChatProps): ReactElement {
  useDeselectOnEscape();
  const { status, messages, error, send } = useMessages(conversationId);

  return (
    <div className={styles.activeChat}>
      <MessageContainer status={status} messages={messages} error={error} />
      <ChatBar onSend={send} />
    </div>
  );
}
