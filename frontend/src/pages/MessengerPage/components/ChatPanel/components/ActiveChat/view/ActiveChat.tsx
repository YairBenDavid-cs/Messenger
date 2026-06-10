import type { ReactElement } from 'react';
import { useMessages } from '@/pages/MessengerPage/domain/message/state/useMessages';
import { useDeselectOnEscape } from '../hooks/useDeselectOnEscape';
import { MessageContainer } from '../components/MessageContainer/view/MessageContainer';
import { ConversationTitle } from '../components/ConversationTitle/view/ConversationTitle';
import { ChatBar } from '../components/ChatBar/view/ChatBar';
import styles from './ActiveChat.module.css';

interface ActiveChatProps {
  conversationId: string;
}

export function ActiveChat({ conversationId }: ActiveChatProps): ReactElement {
  useDeselectOnEscape();
  const { status, messages, error, hasMore, loadingOlder, loadOlder, send } =
    useMessages(conversationId);

  return (
    <div className={styles.activeChat}>
      <ConversationTitle />
      <MessageContainer
        status={status}
        messages={messages}
        error={error}
        hasMore={hasMore}
        loadingOlder={loadingOlder}
        loadOlder={loadOlder}
      />
      <ChatBar onSend={send} />
    </div>
  );
}
