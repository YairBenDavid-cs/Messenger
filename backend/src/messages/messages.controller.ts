import type { RequestHandler } from 'express';
import type { MessageService } from './messages.service';
import { badRequest } from '../shared/AppError';


export function createMessagesController(messageService: MessageService): {
  list: RequestHandler;
  send: RequestHandler;
} {
  return {
    list: async (req, res, next) => {
      try {
        const conversationId = req.params.id;
        const cursorParam = req.query.cursor;
        const cursor = typeof cursorParam === 'string' ? cursorParam : undefined;

        const page = await messageService.getMessages(conversationId, req.userId, cursor);
        res.status(200).json(page);
      } catch (err) {
        next(err);
      }
    },

    send: async (req, res, next) => {
      try {
        const conversationId = req.params.id;
        const { text } = (req.body ?? {}) as { text?: unknown };

        if (typeof text !== 'string' || text.trim().length === 0) {
          throw badRequest('text is required');
        }

        const message = await messageService.sendMessage(conversationId, req.userId, text);
        res.status(201).json(message);
      } catch (err) {
        next(err);
      }
    },
  };
}
