export interface Conversation {
  id: string;
  participants: string[];
  title: string;
  avatarUrl: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

// A draft is a not-yet-created conversation: the chat panel is open and ready to
// type, but nothing is persisted (and it stays out of the sidebar) until the first
// message is sent. The selected id uses this prefix so consumers can detect it.
const DRAFT_PREFIX = 'draft:';

export function makeDraftId(userId: string): string {
  return `${DRAFT_PREFIX}${userId}`;
}

export function isDraftId(id: string | null): boolean {
  return id !== null && id.startsWith(DRAFT_PREFIX);
}
