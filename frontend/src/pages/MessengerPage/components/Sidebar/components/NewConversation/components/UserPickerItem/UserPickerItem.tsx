import type { ReactElement } from 'react';
import type { User } from '@/shared/types/user';
import { Avatar } from '@/shared/ui/Avatar/Avatar';
import styles from './UserPickerItem.module.css';

interface UserPickerItemProps {
  user: User;
  onSelect: (userId: string) => void;
}

export function UserPickerItem({ user, onSelect }: UserPickerItemProps): ReactElement {
  return (
    <button
      type="button"
      className={styles.item}
      onClick={() => onSelect(user.id)}
    >
      <Avatar src={user.avatarUrl} alt={user.name} size={40} />
      <span className={styles.name}>{user.name}</span>
    </button>
  );
}
