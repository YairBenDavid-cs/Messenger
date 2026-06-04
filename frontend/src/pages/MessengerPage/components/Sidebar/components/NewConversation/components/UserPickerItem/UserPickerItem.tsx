import type { ReactElement } from 'react';
import type { User } from '@/shared/types/user';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import styles from './UserPickerItem.module.css';

interface UserPickerItemProps {
  user: User;
  onSelect: (userId: string) => void;
  disabled: boolean;
}

export function UserPickerItem({ user, onSelect, disabled }: UserPickerItemProps): ReactElement {
  return (
    <button
      type="button"
      className={styles.item}
      onClick={() => onSelect(user.id)}
      disabled={disabled}
    >
      <Avatar src={user.avatarUrl} alt={user.username} size={40} />
      <span className={styles.name}>{user.username}</span>
    </button>
  );
}
