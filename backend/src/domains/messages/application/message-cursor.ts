import { BadRequestException } from '@nestjs/common';
import type { Cursor } from '../domain/message.entity';

interface CursorPayload {
  createdAt: string;
  id: string;
}

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

export function encodeCursor(cursor: Cursor): string {
  const payload: CursorPayload = {
    createdAt: cursor.createdAt.toISOString(),
    id: cursor.id,
  };
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCursor(token: string): Cursor {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf8');
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('malformed cursor payload');
    }
    const { createdAt, id } = parsed as Record<string, unknown>;
    if (typeof id !== 'string' || !OBJECT_ID_PATTERN.test(id) || typeof createdAt !== 'string') {
      throw new Error('malformed cursor payload');
    }
    const at = new Date(createdAt);
    if (Number.isNaN(at.getTime())) {
      throw new Error('malformed cursor payload');
    }
    return { createdAt: at, id };
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}
