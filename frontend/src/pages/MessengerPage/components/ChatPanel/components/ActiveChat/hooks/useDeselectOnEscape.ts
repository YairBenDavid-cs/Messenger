import { useEscapeKey } from '@/shared/hooks/useEscapeKey';
import { useConversations } from '@/pages/MessengerPage/domain/conversation/hooks/useConversations';

export function useDeselectOnEscape(): void {
  const { clearSelection } = useConversations();
  useEscapeKey(clearSelection);
}
