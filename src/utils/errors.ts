export type ErrorCode = 'not_found' | 'network' | 'permission' | 'validation' | 'storage' | 'unknown';

/** Typed failure used across services so screens can branch on a stable code. */
export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  if (error instanceof Error && error.message) {
    return new AppError('unknown', error.message);
  }
  return new AppError('unknown', 'Something went wrong.');
}
