import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../AppError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong' });
}
