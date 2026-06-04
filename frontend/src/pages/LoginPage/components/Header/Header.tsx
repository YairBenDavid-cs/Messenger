import type { ReactElement } from 'react';
import styles from './Header.module.css';

export function Header(): ReactElement {
  return <h1 className={styles.header}>Sign Up</h1>;
}
