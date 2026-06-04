import type { ReactElement } from 'react';
import type { Message } from '@/pages/MessengerPage/domain/message/types/message';
import { formatMessageTime } from '@/shared/utils/formatTime';
import styles from './MessageItem.module.css';

interface MessageItemProps {
  message: Message;
  mine: boolean;
}

export function MessageItem({ message, mine }: MessageItemProps): ReactElement {
  const rowClass = mine ? styles.rowMine : styles.rowTheirs;
  const bubbleClass = mine ? `${styles.bubble} ${styles.mine}` : `${styles.bubble} ${styles.theirs}`;

  return (
    <div className={rowClass}>
      <div className={bubbleClass}>
        <span className={styles.text}>{message.text}</span>
        <span className={styles.time}>{formatMessageTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
