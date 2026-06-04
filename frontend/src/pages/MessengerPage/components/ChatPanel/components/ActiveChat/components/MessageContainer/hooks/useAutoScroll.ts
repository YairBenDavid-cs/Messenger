import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export function useAutoScroll<T extends HTMLElement>(dependency: unknown): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (element !== null) {
      element.scrollTop = element.scrollHeight;
    }
  }, [dependency]);

  return ref;
}
