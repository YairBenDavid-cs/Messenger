import { BadRequestException } from '@nestjs/common';
import type { Cursor } from '../domain/message.entity';

interface CursorPayload {
  createdAt: string;
  id: string;
}

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
    const payload = JSON.parse(json) as CursorPayload;
    const createdAt = new Date(payload.createdAt);
    if (typeof payload.id !== 'string' || Number.isNaN(createdAt.getTime())) {
      throw new Error('malformed cursor payload');
    }
    return { createdAt, id: payload.id };
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}
