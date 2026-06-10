export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function badRequest(message: string): AppError {
  return new AppError(400, 'BAD_REQUEST', message);
}

export function unauthorized(message: string): AppError {
  return new AppError(401, 'UNAUTHORIZED', message);
}

export function forbidden(message: string): AppError {
  return new AppError(403, 'FORBIDDEN', message);
}

export function notFound(message: string): AppError {
  
  return new AppError(404, 'NOT_FOUND', message);
}

export function conflict(message: string): AppError {
  return new AppError(409, 'CONFLICT', message);
}

export function internalServerError(message: string): AppError {
  return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
}

