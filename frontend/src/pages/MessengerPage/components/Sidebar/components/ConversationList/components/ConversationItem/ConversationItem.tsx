import type { ReactElement } from 'react';
import type { Conversation } from '@/pages/MessengerPage/domain/conversation/types/conversation';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import { formatConversationTime } from '@/shared/utils/formatTime';
import styles from './ConversationItem.module.css';

interface ConversationItemProps {
  conversation: Conversation;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ConversationItem({
  conversation,
  selected,
  onSelect,
}: ConversationItemProps): ReactElement {
  const { id, title, avatarUrl, lastMessagePreview, lastMessageAt, unreadCount } = conversation;
  const className = selected ? `${styles.item} ${styles.selected}` : styles.item;

  return (
    <button type="button" className={className} onClick={() => onSelect(id)}>
      <Avatar src={avatarUrl} alt={title} size={48} />
      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.title}>{title}</span>
          <span className={styles.time}>{formatConversationTime(lastMessageAt)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.preview}>{lastMessagePreview}</span>
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </div>
      </div>
    </button>
  );
}
