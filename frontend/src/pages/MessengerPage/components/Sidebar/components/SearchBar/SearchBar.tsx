import type { ReactElement } from 'react';
import { SearchIcon } from '@/shared/ui/icons/SearchIcon';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps): ReactElement {
  return (
    <div className={styles.searchBar}>
      <SearchIcon className={styles.icon} />
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search conversations"
      />
    </div>
  );
}
